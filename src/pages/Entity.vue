<template>

  <div>
    <toolbar></toolbar>
    <div>
      <ve-entity-header></ve-entity-header>
    </div>
    <ve-statements></ve-statements>
  </div>
  
  </template>
    
  <script setup lang="ts">
  
    import { watch } from 'vue'
    import { useRouter, useRoute } from 'vue-router'
    import Toolbar from '../components/Toolbar.vue'

    import '@shoelace-style/shoelace/dist/components/tag/tag.js'

    import { useEntitiesStore } from '../store/entities'
    import { storeToRefs } from 'pinia'
    const store = useEntitiesStore()

    const { language, qid } = storeToRefs(store)
    
    const route = useRoute()
    const router = useRouter()

    store.setQid(Array.isArray(route.params.qid) ? route.params.qid[0] : route.params.qid )
    store.setLanguage((Array.isArray(route.query.lang) ? route.query.lang[0] : route.query.lang) || 'en')

    watch(route, () => {
      let qid = Array.isArray(route.params.qid) ? route.params.qid[0]: route.params.qid
      let language = (Array.isArray(route.query.lang) ? route.query.lang[0] : route.query.lang) || 'en'
      store.setQid(qid)
      store.setLanguage(language)
    })

    watch(qid, () => { if (qid.value) setRoute(qid.value, language.value) })
    watch(language, () => { if (qid.value) setRoute(qid.value, language.value) })

  function setRoute(qid:string, lang:string) {
    let options:any = { name: 'entity', params: { qid } }
    if (lang !== 'en') options.query = { lang }
    router.push(options)
  }

  </script>
  
  <style>
  </style>

  