<template>

  <div ref="root">
    <span v-html="props.label" class="title"></span> <span v-if="images" class="count">({{ images?.length.toLocaleString() }})</span>
    <!--
    <ve-image-grid 
      id="wc"
      :active="isActive"
      :total="images?.length || 0" 
      :items="showing" 
      @get-next="getNext" 
      @item-selected="itemSelected" 
    ></ve-image-grid>
    -->
    <ve-pig 
      id="wc"
      :active="isActive"
      :total="images?.length || 0" 
      :items="showing" 
      @get-next="getNext" 
      @item-selected="itemSelected" 
    ></ve-pig>
  </div>

  <sl-dialog :label="label" class="dialog" :style="{'--width':dialogWidth}">
    <div v-if="metadata" class="metadata">
      <ve-statements :eid="metadata.id"></ve-statements>
    </div>
    <sl-button slot="footer" variant="primary" @click="showDialog = false">Close</sl-button>
  </sl-dialog>

</template>

<script setup lang="ts">

  import { computed, nextTick, onMounted, ref, toRaw, watch } from 'vue'
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
  const commonsCategory = computed(() => entity.value?.claims.P373 && entity.value?.claims.P373[0].mainsnak.datavalue.value.replace(/ /g,'_') )

  const wdLicenses = {
    Q6938433: {label: 'CC0', url: 'https://creativecommons.org/publicdomain/zero/1.0/'},

    Q30942811: {label: 'CC BY 1.0', url: 'https://creativecommons.org/licenses/by/1.0/'},
    Q19125117: {label: 'CC BY 2.0', url: 'https://creativecommons.org/licenses/by/2.0/'},
    Q18810333: {label: 'CC BY 2.5', url: 'https://creativecommons.org/licenses/by/2.5/'},
    Q14947546: {label: 'CC BY 3.0', url: 'https://creativecommons.org/licenses/by/3.0/'},
    Q18810143: {label: 'CC BY 3.0 US', url: 'https://creativecommons.org/licenses/by/3.0/us/'},
    Q20007257: {label: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/'},

    Q80837139: {label: 'CC BY-SA 3.0 AT', url: 'https://creativecommons.org/licenses/by-sa/3.0/at/deed.en'},

    Q47001652: {label: 'CC BY-SA 1.0', url: 'https://creativecommons.org/licenses/by-sa/1.0/'},
    Q19068220: {label: 'CC BY-SA 2.0', url: 'https://creativecommons.org/licenses/by-sa/2.0/'},
    Q77143083: {label: 'CC BY-SA 2.0 DE', url: 'https://creativecommons.org/licenses/by-sa/2.0/de/'},
    Q42716613: {label: 'CC BY-SA 3.0 DE', url: 'https://creativecommons.org/licenses/by-sa/3.0/de/deed.de'},
    Q19113751: {label: 'CC BY-SA 2.5', url: 'https://creativecommons.org/licenses/by-sa/2.5/'},
    Q14946043: {label: 'CC BY-SA 3.0', url: 'https://creativecommons.org/licenses/by-sa/3.0/'},
    Q18199165: {label: 'CC BY-SA 4.0', url: 'https://creativecommons.org/licenses/by-sa/4.0/'},

    Q26921686: {label: 'GFDL-1.2-only', url: 'https://www.gnu.org/licenses/old-licenses/fdl-1.2.html'},
    Q27016752: {label: 'GPL-2.0-or-later', url: 'https://spdx.org/licenses/GPL-2.0-or-later.html'},
    Q50829104: {label: 'GFDL-1.2+', url: 'https://www.gnu.org/licenses/old-licenses/fdl-1.2.html'},

    Q152332: {label: 'FAL', url: 'https://artlibre.org/'},
    
    Q99263261: {label: 'No Known Copyright', url: 'https://rightsstatements.org/page/NKC/1.0/?language=en'},
    Q99578078: {label: 'Copyrighted free use', url: 'https://commons.wikimedia.org/wiki/Template:Copyrighted_free_use'},
    Q98923445: {label: 'Attribution only license', url: 'https://commons.wikimedia.org/wiki/Template:Attribution_only_license'},

    Q98592850: {label: 'PD', url: 'https://en.wikipedia.org/wiki/Wikipedia:Granting_work_into_the_public_domain'}

    // : {label: '', url: ''},

  }

  const ccBadges = {
    'BY': 'https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by.png',
    'BY-SA': 'https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by-sa.png',
    'BY-ND': 'https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by-nd.png',
    'BY-NC': 'https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by-nc.png',
    'BY NC EU': 'https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by-nc.eu.png',
    'BY NC SA': 'https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by-nc-sa.png',
    'BY NC SA EU': 'https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by-nc-sa.eu.png',
    'BY NC ND': 'https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by-nc-nd.png',
    'BY NC ND EU': 'https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by-nc-nd.eu.png',
    'CC0': 'https://mirrors.creativecommons.org/presskit/buttons/88x31/png/cc-zero.png',
    'PDM': 'https://mirrors.creativecommons.org/presskit/buttons/88x31/png/publicdomain.png',
    'Public Domain Mark': 'https://mirrors.creativecommons.org/presskit/buttons/88x31/png/publicdomain.png',
    'FAL': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Licence_Art_Libre.svg/367px-Licence_Art_Libre.svg.png',
  }

  watch(entity, () => {
    images.value = []
    if (isActive.value && !images.value.length) doQuery()
    // if (entity.value?.claims.P373) doQuery()
  })

  watch(isActive, async () => {
    if (isActive.value && qid.value !== entity.value?.id) entity.value = await store.fetch(qid.value)
  })

  watch(qid, async () => { 
    console.log(`tagged.watch.qid: isActive=${isActive.value} qid=${qid.value}`)
    images.value = []
    if (isActive.value) entity.value = await store.fetch(qid.value)
  })

  onMounted(async () => { 
    dialog = shadowRoot.value?.querySelector('.dialog')
    dialog.addEventListener('sl-hide', (evt:CustomEvent) => { if (evt.target === dialog) metadata.value = undefined })
    if (isActive.value) entity.value = await store.fetch(qid.value)
  })

  // watch(commonsCategory, () => { console.log(`tagged.watch.commonsCategory: isActive=${isActive.value} qid=${qid.value} commonsCategory=${commonsCategory.value}`) })

  let dialog: any
  const dialogWidth = ref('80vw')
  const showDialog = ref(false)
  watch(showDialog, () => { dialog.open = showDialog.value })

  interface Image {
    aspect_ratio?: number
    attribution?: string
    coords?: string
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
    license_code?: string
    license?: string
    license_url?: string
    license_version?: string
    logo?: string
    pageid?: string
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
    // console.log(toRaw(images.value))
    // let distinct = new Set(images.value.map(image => image.id))
    // let numCreatedBy = images.value.reduce((acc, cur) => acc + (cur.createdBy ? 1 : 0), 0)
    // let numDepicts = images.value.reduce((acc, cur) => acc + (cur.depicts.find(depicted => qid.value === depicted.id) ? 1 : 0), 0)
    // console.log(`distinct=${distinct.size} depicts=${numDepicts} createdBy=${numCreatedBy}`)

    end.value = Math.min(50, images.value.length)
    if (images.value.length)
      fetch(`/api/cache/${qid.value}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(images.value)
        })
  })
  
  const showing = computed(() => { return images.value.slice(0, end.value) })

  const end = ref(0)
  function getNext() {
    end.value = Math.min(end.value + 50, images.value.length)
  }

  const metadata = ref()
  watch(metadata, () => { showDialog.value = metadata.value !== undefined })
  
  const sourcesToInclude = ['wikidata', 'commons', 'atlas', 'commons-categories']

  async function doQuery() {
    images.value = []
    const refreshQarg = new URL(location.href).searchParams.get('refresh')
    const refresh = refreshQarg !== null && ['true', '1', 'yes', ''].includes(refreshQarg.toLowerCase())
  
    if (!refresh) {
      let cachedResults = await fetch(`/api/cache/${qid.value}`)
      console.log(`fromCache=${cachedResults.ok}`)
      if (cachedResults.ok) {
        images.value = await cachedResults.json()
        return
      }
    }

    // console.log(`tagged.doQuery: qid=${qid.value} commonsCategory=${commonsCategory.value} isActive=${isActive.value}`)
    let promises: Promise<any>[] = []
    if (sourcesToInclude.includes('commons')) promises.push(fetch(`/api/commons/${qid.value}`))
    if (sourcesToInclude.includes('wikidata')) promises.push(fetch(`/api/wikidata/${qid.value}`))
    if (sourcesToInclude.includes('atlas')) promises.push(fetch(`/api/atlas/${qid.value}`))
    if (commonsCategory.value && sourcesToInclude.includes('commons-categories')) promises.push(fetch(`/api/commons-categories/${commonsCategory.value}`))
    
    Promise.all(promises).then(async (responses) => {
      let idx = 0
      const commonsData = sourcesToInclude.includes('commons') ? await responses[idx++].json() : []
      const wikidataData = sourcesToInclude.includes('wikidata') ? await responses[idx++].json() : []
      const atlasData = sourcesToInclude.includes('atlas') ? await responses[idx++].json() : []
      const categoriesData = commonsCategory.value && sourcesToInclude.includes('commons-categories') ? await responses[idx++].json() : []
      let all = scoreImages([...atlasData, ...commonsData, ...wikidataData, ...categoriesData]).sort((a: any, b: any) => b.score - a.score)
      let ids = new Set()
      let sources = {}
      let licenses = {}
      let deduped = all
        .filter(img => {
          if (ids.has(img.id)) return false
          ids.add(img.id)
          if (!sources[img.source]) sources[img.source] = 0
          sources[img.source]++
          
          let licenseCode = wdLicenses[img.license?.split('/').pop()]?.label || img.license
          if (!licenses[licenseCode]) licenses[licenseCode] = 0
          licenses[licenseCode]++
          return true
        })
        .map(img => {
          if (['cc','wc','wd'].includes(img.source)) img.logo = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Commons-logo.svg/178px-Commons-logo.svg.png'
          
          img.license_code = wdLicenses[img.license?.split('/').pop()]?.label || img.license
          return img
        })
      console.log(sources)
      console.log(licenses)
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