import Vue from 'vue'
import Router from 'vue-router'

import { mutations } from '@/store'

import App from '@/App'

Vue.use(Router)

const RouteNames = {
  HOME: 'home',

  SEARCH: 'search',
  BLOCKS: 'blocks',
  TRANSACTIONS: 'transactions',

  PRODUCERS: 'producers',
}

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  linkActiveClass: 'active',
  routes: [
    {
      path: '/',
      name: RouteNames.HOME,
      component: App,
    },
    {
      path: '/search/:query?',
      name: RouteNames.SEARCH,
      component: App,
      alias: ['/block/:query', '/transaction/:query', '/address/:query'],
    },
    {
      path: '/blocks',
      name: RouteNames.BLOCKS,
      component: App,
    },

    {
      path: '/transactions',
      name: RouteNames.TRANSACTIONS,
      component: App,
    },

    { path: '/statistics', redirect: '/producers' },
    {
      path: '/producers',
      name: RouteNames.PRODUCERS,
      component: App,
    },
  ],
})

router.beforeEach((to, from, next) => {
  if (
    to.name === RouteNames.SEARCH &&
    typeof to.params.query !== 'undefined' &&
    to.params.query != ''
  ) {
    mutations.setQuery(String(to.params.query))
  } else {
    mutations.setQuery('')
  }

  next()
})

export default router

export { RouteNames }
