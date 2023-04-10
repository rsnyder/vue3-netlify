<template>

  <div class="main">
    <div>
      Header
    </div>
    <ve-wikidata-search></ve-wikidata-search>
    <ve-language-selector></ve-language-selector>
    <!--<ve-theme-selector></ve-theme-selector> -->
  </div>
  
</template>

<style>

  * { box-sizing: border-box; }

  :host {
    display: block;
  }

  .main {
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 6px;
    background-color: var(--sl-color-primary-600);
    border: 1px solid #444;
  }

  ve-wikidata-search {
    margin-left: auto;
  }

  .main > div {
    display: inline-block;
  }

</style>
