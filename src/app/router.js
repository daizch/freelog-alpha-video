import VueRouter from 'vue-router'
import Vue from 'vue'
import Layout from './pages/layout/index.vue';
import Home from './pages/home/index.vue'

Vue.use(VueRouter)


const routes = [{
  path: '/',
  component: Layout,
  children: [
    {
      path: '',
      component: Home
    }
  ]
}]

const router = new VueRouter({
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return {x: 0, y: 0}
    }
  },
  routes
});


export default router

