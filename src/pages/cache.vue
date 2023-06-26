<template>

  <div>
    <pre>{{ data }}</pre>
  </div>
  
  </template>
    
  <script setup lang="ts">
  
    import { computed, ref, onMounted, toRaw, watch } from 'vue'
    import { useRoute } from 'vue-router'

    const route = useRoute()
    const qid = computed(() => route.params.qid )

    const data = <any>ref({})
    
    onMounted(async () => {
      await getData()
      await putData()
    })

    async function getData() {
      console.log(`getData: qid=${qid.value}`)
      let resp = await fetch(`/api/cache/${qid.value}`)
      if (resp.status === 200) {
        let json = await resp.json()
        data.value = json
      } else if (resp.status === 404) {
        console.log(`getData: qid=${qid.value} not found`)
        data.value = { qid }
      }
    }

    async function putData() {
      console.log(`putData: qid=${qid.value}`)
      let resp = await fetch(`/api/cache/${qid.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.value)
      })
      console.log(resp)
    }

  </script>
  
  <style>
  </style>

