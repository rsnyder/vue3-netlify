<template>

  <div class="main">
    <div>
      Header
    </div>
    <ve-wikidata-search @entity-selected="entitySelected($event)"></ve-wikidata-search>
    <ve-language-selector :language="language" @language-selected="languageSelected($event)"></ve-language-selector>
  </div>
  
</template>
  
<script setup lang="ts">

  import { onMounted, ref, toRaw, watch } from 'vue'
  import { useRouter, useRoute } from 'vue-router'

  const props = defineProps({
    language: { type: String, default: 'en' }
  })

  const router = useRouter()
  const route = useRoute()

  const language = ref<string>()
  // watch(language, () => console.log(`Toolbar.watch.language=${language.value}`) )

  onMounted(() => { language.value = props.language })
  watch(props, () => language.value = props.language )

  function entitySelected(evt:CustomEvent) {
    let qid = evt.detail[0].id
    let lang = (Array.isArray(route.query.lang) ? route.query.lang[0] : route.query.lang) || 'en'
    let options:any = { name: 'entity', params: { qid } }
    if (lang !== 'en') options.query = { lang }
    router.push(options)
  }

  function languageSelected(evt:CustomEvent) {
    let qid = route.params.qid
    let lang = evt.detail[0].code
    let options:any = { name: 'entity', params: { qid } }
    if (lang !== 'en') options.query = { lang }
    router.push(options)
  }

</script>

<style>

  * { box-sizing: border-box; }
e
  :host {
    display: block;
  }

  .main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 6px;
    background-color: antiquewhite;
    border: 1px solid #444;
  }

  .main > div {
    display: inline-block;
  }

</style>
