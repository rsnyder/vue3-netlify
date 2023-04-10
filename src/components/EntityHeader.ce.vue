<template>

    <div v-if="entity" class="card">
      
      <div class="text">
        <div class="label">
          <span class="label" v-html="entity.label"></span>
          <span class="wikidata-link">(<a target="_blank" :href="wikidataUrl" v-html="entity.id"></a>)</span>
        </div>
        <div v-if="entity.aliases" class="aliases" v-html="entity.aliases.join(' | ')"></div>
        <div v-if="entity.description" class="description" v-html="entity.description"></div>
        <div class="summary-text">
          <div v-html="summaryText"></div>
          <div class="more" v-if="wikipedia">Source: <a :href="wikipedia.url">{{wikipedia.title}}</a></div>
        </div>
        <div class="links">
          <span v-if="wikipedia" class="wikipedia link" title="Wikipedia"><a target="_blank" :href="wikipedia.url"><img src="https://upload.wikimedia.org/wikipedia/commons/7/77/Wikipedia_svg_logo.svg"></a></span>
          <span class="wikimedia link" title="Wikidata"><a target="_blank" :href="wikidataUrl"><img src="https://upload.wikimedia.org/wikipedia/commons/f/ff/Wikidata-logo.svg"></a></span>
          <span v-if="commonsCategoryUrl" class="wikimedia link" title="Wikimedia Commons"><a target="_blank" :href="commonsCategoryUrl"><img src="https://upload.wikimedia.org/wikipedia/en/4/4a/Commons-logo.svg"></a></span>
          <span v-if="wikiquoteUrl" class="wikimedia link" title="Wikiquote"><a target="_blank" :href="wikiquoteUrl"><img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Wikiquote-logo.svg"></a></span>
          <span v-if="wikivoyageUrl" class="wikimedia link" title="Wikivoyage"><a target="_blank" :href="wikivoyageUrl"><img src="https://upload.wikimedia.org/wikipedia/commons/8/8a/Wikivoyage-logo.svg"></a></span>
        </div>
      </div>
      
      <div v-if="thumbnail" class="image" :style="{
        'background-image': 'url(' + thumbnail + ')',
        'background-size': 'contain',
        'background-position': 'center',
        'background-repeat': 'no-repeat'
      }">
      </div>

    </div> <!-- card -->

</template>

<script setup lang="ts">

  import { computed } from 'vue'
  import {Md5} from 'ts-md5'

  import { useEntitiesStore } from '../store/entities'
  import { storeToRefs } from 'pinia'
  const store = useEntitiesStore()
  const { entity } = storeToRefs(store)

  const image = computed(() => entity.value.claims && entity.value.claims.P18 && entity.value.claims.P18[0].mainsnak.datavalue.value)
  const thumbnail = computed(() => image.value ? mwImage(image.value, 500) : null)

  const wikipedia = computed(() => entity.value.sitelinks )
  const wikidataUrl = computed(() =>  '' )
  const commonsCategoryUrl = computed(() =>  '' )
  const wikiquoteUrl = computed(() =>  '' )
  const wikivoyageUrl = computed(() =>  '' )
  const summaryText = computed(() =>  entity.value.summaryText )

  function mwImage(mwImg: string, width: number) {
    // Converts Wikimedia commons image URL to a thumbnail link
    mwImg = (Array.isArray(mwImg) ? mwImg[0] : mwImg).replace(/Special:FilePath\//, 'File:').split('File:').pop()
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

  .card {
    display: grid;
    grid-template-columns: 1fr minmax(0, 40%);
    grid-template-areas: "text image";
    padding: 12px;
    min-height: 300px;
    gap: 12px;
  }

  .text {
    grid-area: text;
    display: flex;
    flex-direction: column;
  }

  .image {
    grid-area: image;
  }

  .label {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1.5em;
    font-weight: bold;
  }

  .aliases {
    font-size: 1.2em;
    font-style: italic;
    margin-bottom: 12px;
  }

  .description, .summary-text {
    font-size: 1.2em;
    margin: 0 0 12px 0;
  }

  .summary-text p {
    margin: 0 0 9px 0
  }

  .links {
    display: flex;
    gap: 12px;
    margin-top: auto;
  }

  .links img {
    height: 30px;
  }

</style>
