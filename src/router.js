import Vue from 'vue'
import Router from 'vue-router'

import App from '@/App'
// import Blocks from '@/components/blocks'
// import Transaction from '@/components/transaction'
// import Address from '@/components/address'
// import Transactions from '@/components/transactions'
// import Statistics from '@/components/statistics'

Vue.use(Router)

const RouteNames = {
  HOME: 'home',

  SEARCH: 'search',
  BLOCKS: 'blocks',
  TRANSACTIONS: 'transactions',

  STATISTICS: 'statistics',
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
      props: true,
    },
    {
      path: '/blocks',
      name: RouteNames.BLOCKS,
      component: App,
      props: { selected: 'blocksTab' },
    },

    {
      path: '/transactions',
      name: RouteNames.TRANSACTIONS,
      component: App,
      props: { selected: 'transactionsTab' },
    },

    {
      path: '/statistics',
      name: RouteNames.STATISTICS,
      component: App,
      props: { selected: 'statisticsTab' },
    },
  ],
})

export default router

export { RouteNames }
