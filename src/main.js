import { createApp } from 'vue'
import App from './App.vue'
import store from './lib/store.js'
import router from './lib/router.js'
import { defineCustomElement } from 'vue'

/* shoelace.style setup */
// import '@shoelace-style/shoelace/dist/themes/light.css'
// import '@shoelace-style/shoelace/dist/themes/dark.css'
import './themes/juncture.css'

import FontAwesomeIcon from './fontawesome-icons'

import Claims from './components/Claims.ce.vue'
import EntityCard from './components/EntityCard.ce.vue'
import EntityHeader from './components/EntityHeader.ce.vue'
import EntityInfoboxes from './components/EntityInfoboxes.ce.vue'
import LanguageSelector from './components/LanguageSelector.ce.vue'
import Markdown from './components/Markdown.ce.vue'
import Modal from './components/Modal.ce.vue'
import Referencing from './components/Referencing.ce.vue'
import Sites from './components/Sites.ce.vue'
import Statements from './components/Statements.ce.vue'
import Template from './components/Template.ce.vue'
import ThemeSelector from './components/ThemeSelector.ce.vue'
import Viewers from './components/Viewers.ce.vue'
import WikimediaCommons from './components/WikimediaCommons.ce.vue'
import WikidataSearch from './components/WikidataSearch.ce.vue'

customElements.define('ve-claims', defineCustomElement(Claims))
customElements.define('ve-entity-card', defineCustomElement(EntityCard))
customElements.define('ve-entity-header', defineCustomElement(EntityHeader))
customElements.define('ve-entity-infoboxes', defineCustomElement(EntityInfoboxes))
customElements.define('ve-language-selector', defineCustomElement(LanguageSelector))
customElements.define('ve-markdown', defineCustomElement(Markdown))
customElements.define('ve-modal', defineCustomElement(Modal))
customElements.define('ve-referencing', defineCustomElement(Referencing))
customElements.define('ve-sites', defineCustomElement(Sites))
customElements.define('ve-statements', defineCustomElement(Statements))
customElements.define('ve-template', defineCustomElement(Template))
customElements.define('ve-theme-selector', defineCustomElement(ThemeSelector))
customElements.define('ve-viewers', defineCustomElement(Viewers))
customElements.define('ve-wikimedia-commons', defineCustomElement(WikimediaCommons))
customElements.define('ve-wikidata-search', defineCustomElement(WikidataSearch))

const app = createApp(App).component('font-awesome-icon', FontAwesomeIcon)
app.use(router).use(store).mount('#app')
