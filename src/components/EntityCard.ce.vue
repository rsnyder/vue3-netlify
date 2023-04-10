<template>

  <div ref="root" id="card" class="card">
    <div class="label" v-html="label"></div>
    <div class="description" v-html="description"></div>
    <div v-if="backgroundImage" class="image" :style="{backgroundImage, width: thumbnailWidth}"></div>
    <div class="links">
      <span v-if="wikipediaLink" class="logo" title="Wikipedia">
        <a target="_blank" :href="wikipediaLink">
          <img src="https://upload.wikimedia.org/wikipedia/commons/7/77/Wikipedia_svg_logo.svg"/>
        </a>
      </span>
    </div>
    <p v-if="summaryText" class="summary" v-html="summaryText"></p>
  </div>

</template>
  
<script setup lang="ts">

  import { computed, onMounted, ref, toRaw, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useEntitiesStore } from '../store/entities'
  import {Md5} from 'ts-md5'

  const props = defineProps({
    qid: { type: String },
    language: { type: String },
    label: { type: String },
    description: { type: String },
    image: { type: String }
  })

  const root = ref<HTMLElement | null>(null)
  const host = computed(() => (root.value?.getRootNode() as any)?.host)

  const qid = ref<string>()
  const entity = ref<any>()

  const store = useEntitiesStore()
  const { entityData, language } = storeToRefs(store)
  watch(entityData, () => setEntityForLanguage() )
  watch(qid, () => {
    store.fetch(qid.value)
    setEntityForLanguage()
  })

  const label = ref<string>()
  const description = ref<string>()
  const summaryText = ref<string>()
  const backgroundImage = ref<string>()
  const wikipediaLink = ref<string>()

  const thumbnailWidth = computed(() => `${host.value.clientWidth * .33}px`)

  watch(backgroundImage, () => host.value.style.width = '600px')

  onMounted(() => {
    applyProps()
  })

  function applyProps() {
    if (props.qid && qid.value !== props.qid) qid.value = props.qid
    if (props.label) label.value = props.label
    if (props.description) description.value = props.description
    if (props.image) backgroundImage.value = props.image
  }

  watch(entity, () => { 
    label.value = entity.value.label
    description.value = entity.value.description
    let commonsImageFile = entity.value.claims.P18 ? entity.value.claims.P18[0].mainsnak.datavalue.value : null
    if (commonsImageFile) backgroundImage.value = `url('${encodeUrl(mwImage(commonsImageFile, 500))}')`
    // backgroundImage.value = entity.value?.thumbnail && `url('${encodeUrl(entity.value.thumbnail)}')`
    wikipediaLink.value = entity.value.wikipedia
    summaryText.value = entity.value.summaryText
  })

  function encodeUrl(url:string) {
    let parts = url.split('/')
    let encoded = `${parts.slice(0,-1).join('/')}/${encodeURIComponent(parts[parts.length-1])}`
    return encoded
  }

  function unwrap(html:string) {
    let inner = new DOMParser().parseFromString(html, 'text/html')
    return inner.children[0].children[1].children[0].innerHTML
  }

  function setEntityForLanguage() {
    if (qid.value && entityData.value[qid.value]) {
      let lang = props.language || language.value
      let orig = entityData.value[qid.value]
      let _entity:any = {
        id: orig.id,
        label: (orig.labels[lang] || orig.labels.en || orig.labels[Object.keys(orig.labels)[0]]).value
      }
      if (orig.descriptions && orig.descriptions[lang]) _entity.description = orig.descriptions[lang].value
      if (orig.aliases && orig.aliases[lang]) _entity.aliases = orig.aliases[lang].map((a:any) => a.value)
      if (orig.claims) _entity.claims = orig.claims
      if (orig.sitelinks && orig.sitelinks[`${lang}wiki`]) {
        _entity.sitelinks = orig.sitelinks[`${lang}wiki`]
        if (orig.summaryText[lang]) {
          _entity.summaryText = orig.summaryText[lang]
        } else {
          let page: number = orig.sitelinks[`${lang}wiki`].url.replace(/\/w\//, '/wiki').split('/wiki/').pop()
          fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${page}`)
          .then(resp => resp.json())
          .then(resp => {
            store.setSummaryText(qid.value, lang, resp['extract_html'] || resp['extract'])
          })
        }
      }
      entity.value = _entity
    }
  }

  function mwImage(mwImg: string, width: number) {
    // Converts Wikimedia commons image URL to a thumbnail link
    mwImg = decodeURIComponent(mwImg).replace(/ /g,'_')
    const _md5 = Md5.hashStr(mwImg)
    const extension = mwImg.split('.').pop()
    let url = `https://upload.wikimedia.org/wikipedia/commons${width ? '/thumb' : ''}`
    url += `/${_md5.slice(0,1)}/${_md5.slice(0,2)}/${mwImg}`
    if (width) {
      url += `/${width}px-${mwImg}`
      if (extension === 'svg') {
        url += '.png'
      } else if (extension === 'tif' || extension === 'tiff') {
        url += '.jpg'
      }
    }
    return url
  }

</script>

<style>

  * { box-sizing: border-box; }

  :host {
    display:inline-block;
    width: 100%;
  }

  .card {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto auto 1fr auto;
    border: 1px solid #444;
    border-radius: 6px;
    /* min-height: 150px; */
    background-color: white;
    box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
  }

  .label, .description, .summary, .links {
    margin: 6px;
    font-size: 1rem;
  }

  .label {
    grid-area: 1 / 1 / 2 / 2;
    font-size: 130%;
    font-weight: bold;
  }

  .description {
    grid-area: 2 / 1 / 3 / 2;
    font-size: 110%;
    font-weight: 400;
 }

  .summary {
    grid-area: 3 / 1 / 4 / 2;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 6;
    overflow: hidden;
    line-height: 1.2rem;
    font-weight: 300;
  }

  .spacer {
    grid-area: 4 / 1 / 5 / 2;
    height: 100%
  }

  .links {
    grid-area: 5 / 1 / 6 / 2;
  }

  .image {
    grid-area: 1 / 2 / 6 / 3;
    height: 100%;
    object-fit: cover;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
  }

  .logo img {
    height: 24px;
    margin-right: 12px;
    cursor: pointer;
  }

</style>