<template>

  <div ref="root">
    <h1 v-html="props.label"></h1>
    <span v-html="props.id"></span>
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
  let isInitialized = false
  watch(isActive, () => { if (isActive.value&& !isInitialized) init() })

  function init() {
    // Do init processing
    isInitialized = true
  }

</script>

<style>

  h1 {
    margin-top: 0;
    font-size: 1.6em;
  }

</style>