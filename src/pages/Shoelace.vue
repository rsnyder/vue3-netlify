<template>
  <div class="wrapper">
    <sl-button variant="default">Default</sl-button>
    <sl-button variant="primary">Primary</sl-button>
    <sl-button variant="success">Success</sl-button>
    <sl-button variant="neutral">Neutral</sl-button>
    <sl-button variant="warning">Warning</sl-button>
    <sl-button variant="danger" @click="onClick">
      <font-awesome-icon icon="user" slot="prefix"/>
      Danger
    </sl-button>
  </div>
</template>
  
<script setup lang="ts">
  import '@shoelace-style/shoelace/dist/components/button/button.js'

  function onClick(e: PointerEvent) {
    console.log(e)
  }

</script>

<style scoped>
  .wrapper {
    background-color: white;
  }
</style>
