<template>
  <div class="language-selector">
    <sl-dropdown>
      <sl-button slot="trigger" caret v-html="selectedLanguage.label"></sl-button>
      <sl-menu>
        <sl-menu-item v-for="lang in languages" v-html="lang.label" @click="selectedLanguage = lang"></sl-menu-item>
      </sl-menu>
    </sl-dropdown>
  </div>

</template>

<script setup lang="ts">

  import { onMounted, ref, watch } from 'vue'
  import '@shoelace-style/shoelace/dist/components/button/button.js'
  import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js'
  import '@shoelace-style/shoelace/dist/components/icon/icon.js'
  import '@shoelace-style/shoelace/dist/components/menu/menu.js'
  import '@shoelace-style/shoelace/dist/components/menu-item//menu-item.js'

  const emit = defineEmits(['language-selected'])

  const languages = [
    {code: 'ar', label: 'العربية', tooltip: 'Arabic'},
    {code: 'de', label: 'Deutsch', tooltip: 'German'},
    {code: 'en', label: 'English', tooltip: 'English'},
    {code: 'es', label: 'español', tooltip: 'Spanish'},
    {code: 'fr', label: 'français', tooltip: 'French'},
    {code: 'he', label: 'עברית', tooltip: 'Hebrew'},
    {code: 'it', label: 'italiano', tooltip: 'Italian'},
    {code: 'ja', label: '日本語', tooltip: 'Japanese'},
    {code: 'ko', label: '한국어', tooltip: 'Korean'},
    {code: 'nl', label: 'Nederlands', tooltip: 'Dutch'},
    {code: 'pl', label: 'polski', tooltip: 'Polish'},
    {code: 'pt', label: 'português', tooltip: 'Portuguese'},
    {code: 'ru', label: 'русский', tooltip: 'Russian'},
    {code: 'zh', label: '中文', tooltip: 'Chinese'},
    {code: 'hi', label: 'हिन्दी', tooltip: 'Hindi'},
    {code: 'bn', label: 'বাংলা', tooltip: 'Bengali'},
    {code: 'id', label: 'Bahasa Indonesia', tooltip: 'Indonesian'}
  ]

  const props = defineProps({
    language: { type: String, default: 'en' }
  })

  const selectedLanguage = ref<any>(languages.find(lang => lang.code === props.language) || languages.find(lang => lang.code === 'en'))

  onMounted(() => evalProps() )
  watch(props, () => evalProps() )

  watch (selectedLanguage, () => {
    emit('language-selected', selectedLanguage.value)
  })

  function evalProps() {
    selectedLanguage.value = languages.find(lang => lang.code === props.language) || languages.find(lang => lang.code === 'en')
  }

</script>

<style scoped>
</style>