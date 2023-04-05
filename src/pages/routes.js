import {createRouter} from 'vue-router'
import Home from './Home.vue';
import Entity from './Entity.vue';
import Fontawesome from './Fontawesome.vue';
import Shoelace from './Shoelace.vue';

const routes = [
  { name: 'home', path: '/', component: Home },

  { name: 'fontawesome', path: '/fontawesome/', component: Fontawesome },

  { name: 'shoelace', path: '/shoelace/', component: Shoelace },

  { name: 'entity', path: '/entity/:qid', component: Entity },

]

export default function (history) {
  return createRouter({
    history,
    routes
  })
}