import { defineStore } from 'pinia'
import { toRaw } from 'vue'
import { findQids, langLabels } from '../utils'

type Entity = {
  id: string,
  label: string
  description: string
  aliases: string[],
  claims: any,
  summaryText: any,
  sitelinks: any
}

export const useEntitiesStore = defineStore('entities', {
  
  state: () => ({
    qid: null,
    entityData: {},
    language: 'en',
    entity: <Entity>{},
    allLabels: {},
    labels: {},
    urlformatters: {},
    fetching: false,
    labelsFetching: false,
    urlformattersFetching: false,
    active: ''
  }),

  getters: {
    entities(state) {
      return state.entityData
    },

    isFetching(state) {
      return state.fetching
    }
  },

  actions: {
    async fetch(qid:any) {
      // console.log(`entities.fetch: qid=${qid} exists=${this.entityData[qid] !== undefined}`)
      if (!this.entityData[qid]) {
        this.fetching = true
        const response = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`)
        try {
          const result = await response.json()
          Object.values(result.entities).forEach((entity:any) => entity.summaryText = {})
          this.entityData = {...this.entityData, ...result.entities}
          let labelUpdates = {}
          findQids(result.entities[qid].claims).forEach(eid => { 
            if (!this.allLabels[eid]) labelUpdates[eid] = {}
            if (eid[0] === 'P' && !this.urlformatters[eid]) this.urlformatters[eid] = undefined
          })
          if (Object.keys(labelUpdates).length > 0) {
            this.allLabels = {...this.allLabels, ...labelUpdates}
            this.updateLabels()
          }
          this.updateUrlformatters()
        } catch (err) {
          console.error('Error loading entities:', err)
        }
        this.fetching = false
        this.entity = this.setEntityForLanguage(this.qid, this.language, this.entityData)
      }
    },
    setQid(qid:any) {
      if (qid !== this.qid) {
        this.qid = qid
        // console.log(`qid=${this.qid}`)
        if (this.entityData[qid]) {
          this.entity = this.setEntityForLanguage(this.qid, this.language, this.entityData)
          this.updateLabels()
        } else if (qid) {
          this.fetch(qid)
        }
      }
    },
    setSummaryText(qid:any, lang:any, text:any) {
      // console.log(`setEntityForLanguage: qid=${qid} language=${lang} text=${text}`)
      let entity = this.entityData[qid]
      entity.summaryText[lang] = text
      this.entityData = {...this.entityData, ...{[qid]: entity}}
      if (this.qid === qid) this.entity = this.setEntityForLanguage(this.qid, this.language, this.entityData)
    },
    setLanguage(lang:any) {
      if (lang !== this.language) {
        this.language = lang
        // console.log(`language=${this.language}`)
        this.entity = this.setEntityForLanguage(this.qid, this.language, this.entityData)
        this.updateLabels(this.language)
      }
    },

    setActive(active:string) {
      if (active !== this.active) this.active = active
    },

    async updateLabels() {
      if (!this.labelsFetching) {
        let qids = Object.keys(this.allLabels).filter(qid => this.allLabels[qid][this.language] === undefined)
        // console.log(`updateLabels: qids=${qids.length} language=${this.language}`)
        if (qids.length > 0) {
          this.labelsFetching = true
          let values = qids.map(qid => `(<http://www.wikidata.org/entity/${qid}>)`).join(' ')
          let query = `SELECT ?item ?label WHERE { VALUES (?item) { ${values} } ?item rdfs:label ?label . FILTER (LANG(?label) = "${this.language}" || LANG(?label) = "en") .}`
          let resp:any = await fetch('https://query.wikidata.org/sparql', {
            method: 'POST',
            body: new URLSearchParams({query}), 
            headers: { Accept: 'application/sparql-results+json', 'Content-type': 'application/x-www-form-urlencoded' }
          })

          if (resp.ok) {
            let sparqlResp = await resp.json()
            let labels = {...this.allLabels}
            sparqlResp.results.bindings.forEach((rec: any) => {
              let qid = rec.item.value.split('/').pop()
              let label = rec.label.value
              let lang = rec.label['xml:lang']
              labels[qid][lang] = label
            })
            this.allLabels = labels
          }
          this.labelsFetching = false
        }
        this.labels = langLabels(this.allLabels, this.language)
      }
    },

    async updateUrlformatters() {
      if (!this.urlformattersFetching) {
        let qids = Object.keys(this.urlformatters).filter((pid: string) => this.urlformatters[pid] === undefined)
        console.log(`updateUrlformatters: qids=${qids.length}`)
        if (qids.length > 0) {
          this.urlformattersFetching = true
          let values = qids.map(pid => `(<http://www.wikidata.org/entity/${pid}>)`).join(' ')
          let query = `SELECT ?prop ?url WHERE { VALUES (?prop) { ${values} } ?prop wdt:P1630 ?url . }`
          let resp = await fetch('https://query.wikidata.org/sparql', {
            method: 'POST', body: `query=${encodeURIComponent(query)}`, 
            headers: { Accept: 'application/sparql-results+json', 'Content-Type': 'application/x-www-form-urlencoded' }
          })
          let sparqlResp = await resp.json()
          let urlformatters = {...this.urlformatters}
          let updates = Object.fromEntries(sparqlResp.results.bindings.map((rec: any) => [rec.prop.value.split('/').pop(), rec.url.value]))
          if (Object.keys(updates).length > 0) this.urlformatters = {...this.urlformatters, ...updates}
          Object.keys(urlformatters).forEach(pid => urlformatters[pid] = urlformatters[pid] || updates[pid] || null)
          this.urlformatters = urlformatters
        }
        this.urlformattersFetching = false
      }
    },

    setEntityForLanguage(qid:string, language:string, entityData:any) {
      // console.log(`setEntityForLanguage: qid=${qid} language=${language}`, toRaw(entityData))
      if (qid && entityData[qid]) {
        let orig = entityData[qid]
        let _entity:any = {
          id: orig.id,
          label: (orig.labels[language] || orig.labels.en || orig.labels[Object.keys(orig.labels)[0]]).value
        }
        if (orig.descriptions && orig.aliases[language]) _entity.description = orig.descriptions[language].value
        if (orig.aliases && orig.aliases[language]) _entity.aliases = orig.aliases[language].map((a:any) => a.value)
        if (orig.claims) _entity.claims = orig.claims
        if (orig.sitelinks && orig.sitelinks[`${language}wiki`]) {
          _entity.sitelinks = orig.sitelinks[`${language}wiki`]
          if (orig.summaryText[language]) {
            _entity.summaryText = orig.summaryText[language]
          } else {
            let page: number = orig.sitelinks[`${language}wiki`].url.replace(/\/w\//, '/wiki').split('/wiki/').pop()
            fetch(`https://${language}.wikipedia.org/api/rest_v1/page/summary/${page}`)
            .then(resp => resp.json())
            .then(resp => {
              let summaryText = resp['extract_html'] || resp['extract']
              this.setSummaryText(qid, this.language, summaryText)
              // _entity.summaryText = orig.summaryText[language]
            })
          }
        }
        return _entity
      }
    }

  }
})
