<template>

  <div ref="root">
    <h1 v-html="props.label"></h1>
    <div class="cards">
      <div v-for="img in images" :key="img.id" @click="onclick(img.id)">
        <img :src="img.thumb" :alt="img.title"/>
      </div>
    </div>
  </div>

  <sl-dialog :label="label" class="dialog" :style="{'--width':dialogWidth}">
    <div v-if="metadata" class="metadata">
      <h3>{{metadata.id}}</h3>
      <ve-statements :eid="metadata.id"></ve-statements>
      <!--<pre v-html="JSON.stringify(metadata, null, 2)"></pre>-->
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
  const { active, entity } = storeToRefs(store)

  const props = defineProps({
    label: { type: String, default: 'Template' },
    id: { type: String, default: 'template' },
  })

  const root = ref<HTMLElement | null>(null)
  const shadowRoot = computed(() => root?.value?.parentNode)

  const isActive = computed(() => active.value.split('/').pop() === props.id)

  const qid = ref()
  watch(qid, () => {
    fetch(`/api/commons/${qid.value}`)
      .then(resp => resp.json())
      .then(data => images.value = Object.values(data).slice(0,50))
  })

  const images = ref<any[]>([])
  // watch(images, () => console.log(toRaw(images.value)))

  watch(isActive, () => { if (entity.value.id !== qid.value && isActive.value) init() })
  // watch(entity, () => { if (entity.value.id !== qid.value && isActive.value) qid.value = entity.value.id })
  watch(entity, () => { if (entity.value.id !== qid.value && isActive.value) init() })

  const metadata = ref()
  watch(metadata, () => {
    // console.log(toRaw(metadata.value))
    showDialog.value = metadata.value !== undefined
  })
  
  let dialog: any
  const dialogWidth = ref('80vw')
  const showDialog = ref(false)
  watch(showDialog, () => {
    dialog.open = showDialog.value
  })


  function init() {
    dialog = shadowRoot.value?.querySelector('.dialog')
    dialog.addEventListener('sl-hide', (evt:CustomEvent) => {
      if (evt.target === dialog) metadata.value = undefined
    })
    qid.value = entity.value.id
  }

  async function getMetadata(id: string) {
    let data = await store.fetch(id)
    return data
  }

  async function onclick(id: string) {
    metadata.value = await getMetadata(id)
  }


</script>

<style>

  h1 {
    margin-top: 0;
    font-size: 1.6em;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    grid-gap: 16px;
    align-items: stretch;
    padding: 8px;
  }

  .cards > div {
    padding: 12px;
    display: flex;
    flex-direction: column;
  }

</style>