// import { createApp } from 'vue'
import Vue, { createApp } from '@vue/compat' // For bootstrap-vue
import App from './App.vue'
import store from './lib/store.js'
import router from './lib/router.js'

/* bootstrap-vue setup */
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
Vue.use(BootstrapVue)
/* end bootstrap-vue setup */

const app = createApp(App)
app.use(router).use(store).mount('#app')
