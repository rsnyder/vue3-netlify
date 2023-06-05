<template>

  <div ref="root" id="image-grid">
  </div>

</template>

<script setup lang="ts">

  import { computed, onMounted, ref, toRaw, watch } from 'vue'

  const props = defineProps({
    items: { type: Array, default: () => [] }
  })

  const root = ref<HTMLElement | null>(null)
  const shadowRoot = computed(() => root?.value?.parentNode)
  const grid = computed(() => shadowRoot.value?.querySelector('#image-grid') as HTMLElement)
  const gridWidth = ref<number>(0)

  // onMounted(() => { doLayout() })
  watch(props, () => doLayout())

  watch(grid, () => {
    gridWidth.value = grid.value?.clientWidth
    const resizeObserver = new ResizeObserver(() => {
      if (grid.value?.clientWidth !== gridWidth.value) {
        gridWidth.value = grid.value?.clientWidth
        doLayout()
      }
    })
    const imageGrid = shadowRoot.value?.querySelector('#image-grid')
    if (imageGrid) resizeObserver.observe(imageGrid)
    doLayout()
  })

  type Image = {
    width: number;
    height: number;
    mime: string;
    thumb: string;
  };

  function maxImagesInRow(images: Image[], rowWidth: number, maxHeight: number, gap: number): number {
    // console.log('maxImagesInRow', images, rowWidth, maxHeight, gap)
    let scaledImages = images.map((image) => {
      let scale = maxHeight / image.height;
      return { width: image.width * scale, height: maxHeight };
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
    return imageCount;
  }

  function calculateRowHeight(images: Image[], rowWidth: number, gap: number, padding: number) {
    let totalOriginalWidth = images.reduce((sum, image) => sum + image.width, 0);
    let totalGapWidth = gap * (images.length - 1) + (padding * 2) * images.length;
    let scale = (rowWidth - totalGapWidth) / totalOriginalWidth;
    let scaledImages = images.map(image => {
      let width = Number((image.width * scale).toFixed(0))
      let height = Number((image.height * scale).toFixed(0))
      let aspectRatio =  Number((image.width / image.height).toFixed(3))
      return { width, height, aspectRatio }
    })

    // Calculate the row height based on scaled images
    let rowHeight = Math.max(...scaledImages.map(image => image.height));
    return Number((rowHeight).toFixed(0))
  }

  function doLayout() {
    console.log('doLayout', props.items.length, gridWidth.value)
    if (!gridWidth.value) return
    grid.value.innerHTML = ''
    let idx = 0
    while (idx < props.items.length) {
      idx = makeRow(idx)
      // break
    }
  }

  function makeRow(idx:number, gap=20, padding=0) {
    let max = maxImagesInRow(props.items.slice(idx) as Image[], gridWidth.value, 200, gap)
    let rowImages = props.items.slice(idx, idx + max) as Image[]
    let rowHeight = calculateRowHeight(rowImages, gridWidth.value, gap, padding)
    
    console.log(`makeRow: images: ${idx}-${idx + max} rowHeight: ${rowHeight}`)
    
    let row = document.createElement('div')
    row.className = 'grid-row'
    row.style.display = 'flex'
    row.style.gap = `${gap}px`
    row.style.marginBottom = '2rem'
    grid.value?.appendChild(row)

    for (let i = 0; i < rowImages.length; i++) {
      let aspect = Number((rowImages[i].width/rowImages[i].height).toFixed(3))
      let width = Number((rowHeight * aspect).toFixed(0))
      let height = Number((width/aspect).toFixed(0))
      // console.log(`${width} x ${height} (${aspect})`)

      // Create the image card
      let imageCard = document.createElement('div')
      imageCard.className = 'image-card'
      imageCard.style.width = `${width}px`
      imageCard.style.boxShadow = '2px 2px 4px 0 #ccc'

      let image = document.createElement('img')
      image.src = rowImages[i].thumb
      image.style.width = `calc(100% - ${padding * 2}px)`
      imageCard.appendChild(image)

      let text = document.createElement('div')
      text.className = 'text'
      text.innerHTML = `
        <p>${rowImages[i].width.toLocaleString()} x ${rowImages[i].height.toLocaleString()} ${rowImages[i].mime.split('/').pop()}</p>
      `
      imageCard.appendChild(text)

      row.appendChild(imageCard)
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

  .text {
    margin: 6px 0;
  }

  .text p {
    margin: 0;
    padding: 0;
  }

</style>