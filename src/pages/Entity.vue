<template>

  <div>
    <toolbar :language="language"></toolbar>
    <!--
    <div>
      <sl-tag v-for="_, qid in entityData" @click="entitySelected($event)">{{ qid }}</sl-tag>
    </div>
    -->
    <div>
      <ve-entity-header :entity="entity"></ve-entity-header>
    </div>
    <!--<ve-statements :entity="entity"></ve-statements> -->
  </div>
  
  </template>
    
  <script setup lang="ts">
  
    import { onMounted, ref, toRaw, watch } from 'vue'
    import { useRouter, useRoute } from 'vue-router'
    import { storeToRefs } from 'pinia'

    import Toolbar from '../components/Toolbar.vue'

    import '@shoelace-style/shoelace/dist/components/tag/tag.js'

    import { useEntitiesStore } from '../store/entities'

    const store = useEntitiesStore()
    const { entityData } = storeToRefs(store)
    
    const route = useRoute()
    const router = useRouter()

    const qid = ref<string>()
    const language = ref<string>('en')

    const entity = ref<any>()

    watch(qid, () => {
      store.fetch(qid.value)
      if (qid.value && entityData.value[qid.value]) setEntityForLanguage()
    })
    watch(language, () => {
      setEntityForLanguage()
    })
    watch(entityData, () => setEntityForLanguage())
    // watch(entity, () => console.log(toRaw(entity.value)))
  
    onMounted(() => {
      qid.value = Array.isArray(route.params.qid) ? route.params.qid[0] : route.params.qid 
      language.value = (Array.isArray(route.query.lang) ? route.query.lang[0] : route.query.lang) || 'en'
      // console.log(`onMounted: qid: ${qid.value}, language: ${language.value}`)
    })

    watch(route, () => {
      qid.value = Array.isArray(route.params.qid) ? route.params.qid[0]: route.params.qid 
      language.value = (Array.isArray(route.query.lang) ? route.query.lang[0] : route.query.lang) || 'en'
      // console.log(`watch.route: qid: ${qid.value}, language: ${language.value}`)
    })

    function entitySelected(item:any) {
      let options:any = { name: 'entity', params: { qid: item.id || item.srcElement.innerText } }
      if (language.value !== 'en') options.query = { lang: language.value }
      router.push(options)
    }

    function setEntityForLanguage() {
      if (qid.value && entityData.value[qid.value]) {
        let orig = entityData.value[qid.value]
        let _entity:any = {
          id: orig.id,
          label: (orig.labels[language.value] || orig.labels.en || orig.labels[Object.keys(orig.labels)[0]]).value
        }
        if (orig.descriptions && orig.aliases[language.value]) _entity.description = orig.descriptions[language.value].value
        if (orig.aliases && orig.aliases[language.value]) _entity.aliases = orig.aliases[language.value].map((a:any) => a.value)
        if (orig.claims) _entity.claims = orig.claims
        if (orig.sitelinks && orig.sitelinks[`${language.value}wiki`]) {
          _entity.sitelinks = orig.sitelinks[`${language.value}wiki`]
          if (orig.summaryText[language.value]) {
            _entity.summaryText = orig.summaryText[language.value]
          } else {
            let page: number = orig.sitelinks[`${language.value}wiki`].url.replace(/\/w\//, '/wiki').split('/wiki/').pop()
            fetch(`https://${language.value}.wikipedia.org/api/rest_v1/page/summary/${page}`)
            .then(resp => resp.json())
            .then(resp => {
              store.setSummaryText(qid.value, language.value, resp['extract_html'] || resp['extract'])
            })
          }
        }
        entity.value = _entity
      }
    }

  </script>
  
  <style>
  </style>

  