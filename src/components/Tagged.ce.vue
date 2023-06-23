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
  watch(isActive, () => { if (isActive.value && !images.value.length) doQuery() })

  watch(qid, () => {
    images.value = []
    if (isActive.value) doQuery()
  })

  onMounted(() => { 
    dialog = shadowRoot.value?.querySelector('.dialog')
    dialog.addEventListener('sl-hide', (evt:CustomEvent) => { if (evt.target === dialog) metadata.value = undefined })
    if (isActive.value) doQuery() 
  })

  let dialog: any
  const dialogWidth = ref('80vw')
  const showDialog = ref(false)
  watch(showDialog, () => { dialog.open = showDialog.value })

  interface ImageData {
    id: string;
    thumb: string;
    alt: string;
    width: number;
    height: number;
    createdBy: boolean;
    depicts: any[];
  }

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
    // console.log(`tagged.doQuery: qid=${qid.value} isActive=${isActive.value}`)
    Promise.all([
      fetch(`/api/commons/wc/${qid.value}`),
      fetch(`/api/commons/wd/${qid.value}`),
      fetch(`/api/atlas/${qid.value}`)
    ]).then(async ([commons, wikidata, atlas]) => {
      const commonsData = await commons.json()
      const wikidataData = await wikidata.json()
      const atlasData = await atlas.json()
      console.log(commonsData)
      console.log(atlasData)
      images.value = [...atlasData, ...commonsData, ...wikidataData]
        .map((item: any) => transformItem(item))
        .sort((a: any, b: any) => b.score - a.score)
    })
  }

  function transformItem(item: any): Image {
    let doc: Image = {id: item.id, source: 'wc'}
    doc.url = item.detail_url
    if (item.label) doc.title = item.label
    if (item.description) doc.description = item.description
    if (item.license) doc.license = item.license
    doc.url = item.url
    doc.thumbnail = item.thumbnail
    doc.width = item.width
    doc.height = item.height
    doc.aspect_ratio = item.aspect_ratio
    return doc
  }

  async function getMetadata(id: string) {
    return await store.fetch(id)
  }

  async function itemSelected(evt: CustomEvent) {
    metadata.value = await getMetadata(evt.detail[0].id)
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