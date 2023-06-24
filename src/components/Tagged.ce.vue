<template>

  <div ref="root">
    <span v-html="props.label" class="title"></span> <span v-if="images" class="count">({{ images?.length.toLocaleString() }})</span>
    <ve-image-grid 
      id="wc"
      :active="isActive"
      :total="images?.length || 0" 
      :items="showing" 
      @get-next="getNext" 
      @item-selected="itemSelected" 
    ></ve-image-grid>
  </div>

  <sl-dialog :label="label" class="dialog" :style="{'--width':dialogWidth}">
    <div v-if="metadata" class="metadata">
      <ve-statements :eid="metadata.id"></ve-statements>
    </div>
    <sl-button slot="footer" variant="primary" @click="showDialog = false">Close</sl-button>
  </sl-dialog>

</template>

<script setup lang="ts">

  import { computed, onMounted, ref, toRaw, watch } from 'vue'
  import '@shoelace-style/shoelace/dist/components/dialog/dialog.js'
  import { useEntitiesStore } from '../store/entities'
  import { storeToRefs } from 'pinia'
  
  const store = useEntitiesStore()
  const { active, qid } = storeToRefs(store)

  const props = defineProps({
    label: { type: String },
    id: { type: String },
  })

  const root = ref<HTMLElement | null>(null)
  const shadowRoot = computed(() => root?.value?.parentNode as HTMLElement)
  const isActive = computed(() => active.value.split('/').pop() === props.id)

  const entity = ref<any>()
  const commonsCategory = computed(() => entity.value?.claims.P373[0].mainsnak.datavalue.value.replace(/ /g,'_') )

  watch(entity, () => {
    images.value = []
    console.log(toRaw(entity.value))
    if (isActive.value && !images.value.length) doQuery()
    // if (entity.value?.claims.P373) doQuery()
  })

  watch(isActive, async () => {
    if (isActive.value && qid.value !== entity.value?.id) entity.value = await store.fetch(qid.value)
  })

  watch(qid, async () => { 
    images.value = []
    if (isActive.value) entity.value = await store.fetch(qid.value)
  })

  onMounted(async () => { 
    dialog = shadowRoot.value?.querySelector('.dialog')
    dialog.addEventListener('sl-hide', (evt:CustomEvent) => { if (evt.target === dialog) metadata.value = undefined })
    if (isActive.value) entity.value = await store.fetch(qid.value)
  })

  watch(commonsCategory, () => { console.log(`cc.watch.commonsCategory: isActive=${isActive.value} qid=${qid.value} commonsCategory=${commonsCategory.value}`) })

  let dialog: any
  const dialogWidth = ref('80vw')
  const showDialog = ref(false)
  watch(showDialog, () => { dialog.open = showDialog.value })

  interface Image {
    aspect_ratio?: number
    attribution?: string
    creator?: string
    creator_url?: string
    depicts?: string[]
    description?: string
    detail_url?: string
    foreign_landing_url?: string
    format?: string
    id: string
    imageQualityAssessment?: string
    height?: number
    license?: string
    license_url?: string
    license_version?: string
    provider?: string
    score?: number
    source?: string
    tags?: string[]
    title?: string
    thumbnail?: string
    url?: string
    width?: number
  }

  const images = ref<Image[]>([])
  watch(images, () => { 
    // let distinct = new Set(images.value.map(image => image.id))
    // let numCreatedBy = images.value.reduce((acc, cur) => acc + (cur.createdBy ? 1 : 0), 0)
    // let numDepicts = images.value.reduce((acc, cur) => acc + (cur.depicts.find(depicted => qid.value === depicted.id) ? 1 : 0), 0)
    // console.log(`distinct=${distinct.size} depicts=${numDepicts} createdBy=${numCreatedBy}`)

    end.value = Math.min(20, images.value.length)
  })
  
  const end = ref(0)
  function getNext() {
    end.value = Math.min(end.value + 20, images.value.length)
  }

  const showing = computed(() => images.value.slice(0, end.value))
  watch(showing, () => { 
    // if (showing.value.length) console.log(`tagged.watch.images: qid=${qid.value} isActive=${isActive.value} images=${images.value.length} showing=${end.value}`)    
  })

  const metadata = ref()
  watch(metadata, () => { showDialog.value = metadata.value !== undefined })
  
  function doQuery() {
    images.value = []
    console.log(`tagged.doQuery: qid=${qid.value} commonsCategory=${commonsCategory.value} isActive=${isActive.value}`)
    let promises = [
      fetch(`/api/commons/${qid.value}`),
      fetch(`/api/wikidata/${qid.value}`),
      fetch(`/api/atlas/${qid.value}`)
    ]
    if (commonsCategory.value) promises.push(fetch(`/api/commons-categories/${commonsCategory.value}`))
    Promise.all(promises).then(async ([commons, wikidata, atlas, categories]) => {
      const commonsData = await commons.json()
      const wikidataData = await wikidata.json()
      const atlasData = await atlas.json()
      const categoriesData = categories ? await categories.json() : []
      let all = scoreImages([...atlasData, ...commonsData, ...wikidataData, ...categoriesData])
        .sort((a: any, b: any) => b.score - a.score)
      let ids = new Set()
      let sources = {}
      let deduped = all.filter(img => {
        if (ids.has(img.id)) return false
        ids.add(img.id)
        if (!sources[img.source]) sources[img.source] = 0
        sources[img.source]++
        return true
      })
      console.log(sources)
      images.value = deduped
    })
  }

  async function getMetadata(id: string) {
    return await store.fetch(id)
  }

  async function itemSelected(evt: CustomEvent) {
    metadata.value = await getMetadata(evt.detail[0].id)
  }

  function scoreImages(images) {
    return images.map(img => {
      img.score = 0
      if (img.depicts) {
        let depicted: any = Object.values(img.depicts).find((d:any) => d.id === qid.value)
        if (depicted?.dro) img.score += 5
        else if (depicted?.prominent) img.score += 2
      }
      if (img.imageQualityAssessment === 'featured') img.score += 3
      else if (img.imageQualityAssessment === 'quality') img.score += 2
      else if (img.imageQualityAssessment === 'valued') img.score += 1
      return img
    })
  }

</script>

<style>
  .title {
    font-size: 1.5em;
    font-weight: bold;
  }
  .count {
    font-size: 1.2;
    color: #666;
    padding-left: .5em;
  }
</style>