import { defineStore } from 'pinia'

export const useEntitiesStore = defineStore('entities', {
  
  state: () => ({
      entityData: {},
      fetching: false
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
        } catch (err) {
          console.error('Error loading entities:', err)
        }
        this.fetching = false
      }
    },
    setSummaryText(qid:any, lang:any, text:any) {
      let entity = this.entityData[qid]
      entity.summaryText[lang] = text
      this.entityData = {...this.entityData, ...{[qid]: entity}}
    }
  }
})