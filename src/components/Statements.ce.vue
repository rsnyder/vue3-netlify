<template>

  <div>
    <div>
      <span>Label: </span><span v-html="entity?.label"></span>
    </div>
    <div v-if="entity?.description">
      <span>Description: </span><span v-html="entity.description"></span>
    </div>
  </div>
  
  </template>
    
<script setup lang="ts">

  import { onMounted, ref, watch } from 'vue'

  const props = defineProps({
    entity: { type: Object }
  })

  const entity = <any>ref()

  onMounted(() => evalProps())
  watch(props, () => evalProps())

  function evalProps() {
    console.log('Statements.evalProps', props.entity)
    entity.value = props.entity
  }

</script>

<style>
</style>