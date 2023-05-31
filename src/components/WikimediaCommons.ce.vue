<template>

  <div ref="root">
    <h1 v-html="props.label"></h1>
    <div class="cards">
      <div v-for="img in images" :key="img.id">
        <img :src="img.thumb" :alt="img.title" />
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">

  import { computed, onMounted, ref, toRaw, watch } from 'vue'

  import { useEntitiesStore } from '../store/entities'
  import { storeToRefs } from 'pinia'
  const store = useEntitiesStore()
  const { active, entity } = storeToRefs(store)

  const props = defineProps({
    label: { type: String, default: 'Template' },
    id: { type: String, default: 'template' },
  })

  const isActive = computed(() => active.value.split('/').pop() === props.id)

  const qid = ref()
  watch(qid, () => {
    fetch(`/api/commons/${qid.value}`)
      .then(resp => resp.json())
      .then(data => images.value = Object.values(data).slice(0,50))
  })

  const images = ref<any[]>([])
  watch(images, () => console.log(toRaw(images.value)))

  watch(isActive, () => { if (entity.value.id !== qid.value && isActive.value) init() })
  watch(entity, () => { if (entity.value.id !== qid.value && isActive.value) qid.value = entity.value.id })

  function init() {
    qid.value = entity.value.id
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