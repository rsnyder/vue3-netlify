<template>

  <div ref="root">
    <toolbar></toolbar>
  </div>
  
  </template>
    
  <script setup lang="ts">
  
    import { computed, onMounted, ref, toRaw, watch, nextTick } from 'vue'
    import Toolbar from '../components/Toolbar.vue'
  
    const root = ref<HTMLElement | null>(null)
    const host = computed(() => (root.value?.getRootNode() as any)?.host)
    const shadowRoot = computed(() => root?.value?.parentNode)
    
    onMounted(() => init() )
  
    function init() {
      console.log('Home.init')
    }
  
  </script>
  
  <style>
  </style>