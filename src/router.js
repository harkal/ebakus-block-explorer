import Vue from 'vue'
import Router from 'vue-router'

import { mutations } from '@/store'

import App from '@/App'
import Home from '@/components/Home'
import Richlist from '@/components/Richlist'

Vue.use(Router)

const RouteNames = {
  HOME: 'home',

  SEARCH: 'search',
  BLOCK: 'block',
  TRANSACTION: 'transaction',
  ADDRESS: 'address',
  ENS: 'ens',

  BLOCKS: 'blocks',
  TRANSACTIONS: 'transactions',
  RICHLIST: 'richlist',

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
      component: Home,
    },
    {
      path: '/search/:query?',
      name: RouteNames.SEARCH,
      component: App,
      alias: [
        '/block/:query',
        '/transaction/:query',
        '/address/:query',
        '/ens/:query',
      ],
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

    {
      path: '/richlist',
      name: RouteNames.RICHLIST,
      component: Richlist,
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
