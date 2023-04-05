import { createApp } from 'vue'
import App from './App.vue'
import store from './lib/store.js'
import router from './lib/router.js'
import { defineCustomElement } from 'vue'

/* shoelace.style setup */
import '@shoelace-style/shoelace/dist/themes/light.css'

import FontAwesomeIcon from './fontawesome-icons'

import EntityCard from './components/EntityCard.ce.vue'
import EntityHeader from './components/EntityHeader.ce.vue'
import LanguageSelector from './components/LanguageSelector.ce.vue'
import Statements from './components/Statements.ce.vue'
import WikidataSearch from './components/WikidataSearch.ce.vue'

customElements.define('ve-entity-card', defineCustomElement(EntityCard))
customElements.define('ve-entity-header', defineCustomElement(EntityHeader))
customElements.define('ve-language-selector', defineCustomElement(LanguageSelector))
customElements.define('ve-statements', defineCustomElement(Statements))
customElements.define('ve-wikidata-search', defineCustomElement(WikidataSearch))

const app = createApp(App).component('font-awesome-icon', FontAwesomeIcon)
app.use(router).use(store).mount('#app')
