<template>

  <div ref="root" id="image-grid"></div>

</template>

<script setup lang="ts">

  import { computed, nextTick, onMounted, ref, toRaw, watch } from 'vue'
  import { Pig } from '../pig'

  const emit = defineEmits(['item-selected', 'get-next'])

  const props = defineProps({
    items: { type: Array, default: () => [] },
    id: { type: String },
    active: { type: Boolean, default: true }
  })

  watch(props, () => {
    isActive.value = props.active
    imageData.value = props.items as Image[] || []
  })

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
    height: number
    license?: string
    license_url?: string
    license_version?: string
    provider?: string
    score?: number
    source?: string
    tags?: string[]
    title?: string
    thumbnail: string
    url?: string
    width: number
  }

  const root = ref<HTMLElement | null>(null)
  const shadowRoot = computed(() => root?.value?.parentNode)
  const grid = computed(() => shadowRoot.value?.querySelector('#image-grid') as HTMLElement)
  const gridWidth = ref<number>(0)

  const isActive = ref(props.active)

  let pig

  const imageData = <any>ref(props.items)
  watch(imageData, async (current, prior) => {
    // console.log(`pig.watch.imageData: size=${current.length}`)
    if (imageData.value.length === 0) return
    
    let added = imageData.value.slice(prior?.length || 0, imageData.value.length)
    await checkImagesSizes(added)

    if (pig) {
      pig.addImages(added)
    } else {
      pig = new Pig(imageData.value, {
        container: shadowRoot.value?.querySelector('#image-grid') as HTMLElement,
        loadMoreCallback: () => { emit('get-next') }
      }).enable()
    }
    
  })

  onMounted(() => { 
    console.log(`pig.onMounted: isActive=${isActive.value} images=${imageData.value.length}`)
  })

  watch(isActive, () => {
    console.log(`pig.watch.isActive: isActive=${isActive.value} images=${imageData.value.length}`)
  })

  watch(grid, () => {
    gridWidth.value = grid.value?.clientWidth
    console.log(`pig.watch.grid: width=${gridWidth.value} isActive=${isActive.value} images=${imageData.value.length}`)
  })

  async function checkImagesSizes(images:Image[]) {
    
    let promises = images
      .filter((image:any) => !image.width)
      .map((image:any) => getImageSize(image))

    // console.log(`pig.checkImagesSizes: ${promises.length} images`)
    if (promises.length) {
      let results = await Promise.all(promises)
      results.forEach((result:any) => {
        let found:any = images.find((item:any) => result.id === item.id)
        found.width = result.width
        found.height = result.height
        found.aspect_ratio = result.aspect_ratio
        found.mime = result.mime
      })
    }
  }

  async function getImageSize(image: any, minWidth=200): Promise<{ image:any, width: number, height: number }> {
    return new Promise((resolve, reject) => {
      let img = new Image()
      img.onload = () => {
        let width = img.width < minWidth ? minWidth : img.width
        let height = img.width < minWidth ? img.height * minWidth/img.width : img.height
        let aspect_ratio = Number((width/height).toFixed(4))
        resolve({...image, width, height, aspect_ratio, mime: 'image/jpeg'})
      }
      img.onerror = () => reject()
      img.src = image.thumbnail
    })
  }

</script>

<style>

  * { box-sizing: border-box; }

  #image-grid {
    position: relative;
    margin: 2rem;    
  }

  .pig-figure {
    background-color: #D5D5D5;
    overflow: hidden;
    left: 0;
    position: absolute;
    top: 0;
    margin: 0;
  }

  .pig-figure img {
    left: 0;
    position: absolute;
    top: 0;
    height: 100%;
    width: 100%;
    opacity: 0;
    transition: 0.5s ease opacity;
    -webkit-transition: 0.5s ease opacity;
  }

  .pig-figure img.pig-thumbnail {
    -webkit-filter: blur(30px);
    filter: blur(30px);
    left: auto;
    position: relative;
    width: auto;
  }

  .pig-figure img.pig-loaded {
    opacity: 1;
  }

  .image-card {
    font-size: 0.85em;
    display: flex;
    flex-direction: column;
  }

  .clamp {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    /* margin-bottom: 6px; */
  }

  .text {
    margin: 6px 0;
    height: 50px;
  }

  .text p {
    margin: 0;
    padding: 0;
  }

</style>