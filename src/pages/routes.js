import {createRouter} from 'vue-router'
import Homepage from './Home.vue';
import Cart from './Cart.vue';
import Bootstrap from './Bootstrap.vue';
import { SignInComponent } from './user';

const routes = [
  { path: '/', component: Homepage },

  { path: '/sign-in/', component: SignInComponent },

  { path: '/cart/', component: Cart },

  { path: '/bootstrap/', component: Bootstrap },

]

export default function (history) {
  return createRouter({
    history,
    routes
  })
}