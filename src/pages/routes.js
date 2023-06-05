import {createRouter} from 'vue-router'
import Home from './Home.vue';
import Entity from './Entity.vue';
import Shoelace from './Shoelace.vue';
import ImageGrid from './ImageGrid.vue';

const routes = [
  { name: 'home', path: '/', component: Home },

  { name: 'shoelace', path: '/shoelace/', component: Shoelace },

  { name: 'entity', path: '/entity/:qid', component: Entity },

  { name: 'image-grid', path: '/image-grid/', component: ImageGrid },

]

export default function (history) {
  return createRouter({
    history,
    routes
  })
}