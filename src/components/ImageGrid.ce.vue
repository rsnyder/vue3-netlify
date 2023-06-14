<template>

  <div ref="root" id="image-grid"></div>

</template>

<script setup lang="ts">

  import { computed, nextTick, onMounted, ref, toRaw, watch } from 'vue'
  
  const emit = defineEmits(['item-selected', 'get-next'])

  const props = defineProps({
    items: { type: Array, default: () => [] },
    id: { type: String },
    active: { type: Boolean, default: true }
  })

  watch(props, () => {
    isActive.value = props.active
    images.value = props.items as Image[] || []
  })

  interface Image {
    id: string
    label: string
    description: string
    width: number
    height: number
    mime: string
    thumb: string
    score: number
  }

  const root = ref<HTMLElement | null>(null)
  const shadowRoot = computed(() => root?.value?.parentNode)
  const grid = computed(() => shadowRoot.value?.querySelector('#image-grid') as HTMLElement)
  const gridWidth = ref<number>(0)

  const isActive = ref(props.active)

  const images = <any>ref(props.items)
  watch(images, async (current, prior) => {
    
    if (!current.length) {
      shadowRoot.value?.querySelectorAll('.grid-row').forEach((row) => row.remove())
    }

    await checkImagesSizes(images.value.slice(prior?.length || 0))

    let idx = 0
    if (prior?.length > 0) {
      let lastRow = Array.from(shadowRoot.value?.querySelectorAll('.grid-row') || []).pop()
      let firstCardInLastRow = lastRow?.firstChild as HTMLElement
      idx = images.value.findIndex((image:any) => image.id === firstCardInLastRow.getAttribute('data-id'))
      lastRow?.remove()
    }

    while (idx < images.value.length) idx = makeRow(idx)

  })

  onMounted(() => { 
    window.addEventListener('scroll', () => {
      if (props.active && window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
        emit('get-next')
      }
    })
  })


  watch(grid, () => {
    gridWidth.value = grid.value?.clientWidth
    const resizeObserver = new ResizeObserver(() => {
      if (grid.value?.clientWidth && grid.value?.clientWidth !== gridWidth.value) {
        gridWidth.value = grid.value?.clientWidth
        doLayout()
      }
    })
    nextTick(() => {
      const imageGrid = shadowRoot.value?.querySelector('#image-grid')
      if (imageGrid) resizeObserver.observe(imageGrid)
    })
  })

  async function checkImagesSizes(images:Image[]) {
    
    let promises = images
      .filter((image:any) => !image.width)
      .map((image:any) => getImageSize(image))

    if (promises.length) {
      let results = await Promise.all(promises)
      results.forEach((result:any) => {
        let found:any = images.find((item:any) => result.id === item.id)
        found.width = result.width
        found.height = result.height
        found.mime = result.mime
      })
    }
  }

  async function getImageSize(image: any, minWidth=200): Promise<{ image:any, width: number, height: number }> {
    return new Promise((resolve, reject) => {
      let img = new Image()
      img.onload = () => {
        let width = img.width < 250 ? 250 : img.width
        let height = img.width < 250 ? img.height * 250/img.width : img.height
        resolve({...image, width, height, mime: 'image/jpeg'})
      }
      img.onerror = () => reject()
      img.src = image.thumb
    })
  }

  function maxImagesInRow(images: Image[], rowWidth: number, maxHeight: number, gap: number): number {
    // console.log('maxImagesInRow', images, rowWidth, maxHeight, gap)
    let scaledImages = images.map((image) => {
      let scale = maxHeight / image.height;
      return { width: image.width * scale || 200, height: maxHeight };
    });

    let currentWidth = 0;
    let imageCount = 0;
    for (let i = 0; i < scaledImages.length; i++) {
      currentWidth += scaledImages[i].width;
      if (i !== 0) {
        currentWidth += gap; // add the gap between images
      }
      if (currentWidth <= rowWidth) {
        imageCount++;
      } else {
        break;
      }
    }
    return imageCount || 1;
  }

  function calculateRowHeight(images: Image[], rowWidth: number, gap: number, padding: number) {
    let totalOriginalWidth = images.reduce((sum, image) => sum + image.width, 0);
    let totalGapWidth = gap * (images.length - 1) + (padding * 2) * images.length;
    let scale = (rowWidth - totalGapWidth) / totalOriginalWidth;
    let scaledImages = images.map(image => {
      let origWidth = image.width || 100
      let origHeight = image.height || 100
      let width = Number((origWidth * scale).toFixed(0))
      let height = Number((origHeight * scale).toFixed(0))
      let aspectRatio =  Number((origWidth / origHeight).toFixed(3))
      return { width, height, aspectRatio }
    })

    // Calculate the row height based on scaled images
    let rowHeight = Math.max(...scaledImages.map(image => image.height));
    return Number((rowHeight).toFixed(0))
  }

  function doLayout() {
    if (!isActive || !gridWidth.value) return
    shadowRoot.value?.querySelectorAll('.grid-row').forEach((row) => row.remove())
    let idx = 0
    while (idx < images.value.length && idx < images.value.length) idx = makeRow(idx)
  }

  function makeRow(idx:number, gap=20, padding=0) {
    let max = maxImagesInRow(images.value.slice(idx) as Image[], gridWidth.value, 250, gap)
    let rowImages = images.value.slice(idx, idx + max) as Image[]

    let rowHeight = calculateRowHeight(rowImages, gridWidth.value, gap, padding)
    if (rowHeight < 0) return idx + max

    // console.log(`makeRow: images: ${idx+1}-${idx + max} rowHeight: ${rowHeight}`)
    
    let row = document.createElement('div')
    row.className = 'grid-row'
    row.style.display = 'flex'
    row.style.gap = `${gap}px`
    row.style.marginBottom = '2rem'
    grid.value?.appendChild(row)

    for (let i = 0; i < rowImages.length; i++) {
      let image = rowImages[i]
      let aspect = Number((image.width/image.height).toFixed(3))
      let width = rowHeight < 500
        ? Number((rowHeight * aspect).toFixed(0))
        : Number((350 * aspect).toFixed(0))
      
      // Create the image card
      let imageCardEl = document.createElement('div')
      imageCardEl.className = 'image-card'
      imageCardEl.style.width = `${width}px`
      imageCardEl.style.boxShadow = '2px 2px 4px 0 #ccc'
      imageCardEl.style.borderRadius = '4px'
      imageCardEl.setAttribute('data-id', image.id)
      imageCardEl.addEventListener('click', () => emit('item-selected', image))

      let imgEl = document.createElement('img')
      imgEl.src = image.thumb
      imgEl.style.width = `calc(100% - ${padding * 2}px)`
      imageCardEl.appendChild(imgEl)

      let textEl = document.createElement('div')
      textEl.className = 'text'
      let textItems:string[] = []
      textItems.push(`<div>${idx + i + 1}</div>`)
      if (image.label) textItems.push(`<div class="clamp">${image.label}</div>`)
      // if (image.width) textItems.push(`<p>${image.width.toLocaleString()} x ${image.height.toLocaleString()} ${image.mime.split('/').pop()}</p>`)
      // if (image.score) textItems.push(`<p>Score: ${image.score}</p>`)
      textEl.innerHTML = textItems.join('')
      imageCardEl.appendChild(textEl)

      row.appendChild(imageCardEl)
    }

    return idx + max // return the index of the next image

  }

</script>

<style>

  * { box-sizing: border-box; }

  #image-grid {
    margin: 2rem;    
  }

  .image-card {
    font-size: 0.85em;
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