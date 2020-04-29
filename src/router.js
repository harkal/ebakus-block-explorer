import Vue from 'vue'
import Router from 'vue-router'

import { mutations } from '@/store'
import { getAddressForEns, storeEnsNameForAddress } from '@/utils/ens'

import Home from '@/components/Home'
import Blocks from '@/components/Blocks'
import Block from '@/components/Block'
import Transactions from '@/components/Transactions'
import Transaction from '@/components/Transaction'
import Address from '@/components/Address'
import Richlist from '@/components/Richlist'
import Producers from '@/components/Producers'

Vue.use(Router)

const hasHexPrefix = hex => hex.substring(0, 2) == '0x'

const searchRouteBeforeEnter = async (to, from, next) => {
  const { params: { query } = {} } = to

  if (isNaN(query) || hasHexPrefix(query) || query == '') {
    if (hasHexPrefix(query)) {
      if (query.length == 42) {
        next({ name: RouteNames.ADDRESS, params: { query } })
        return
      } else if (query.length == 66) {
        next({ name: RouteNames.TRANSACTION, params: { query } })
        return
      }
    } else {
      if (query != '') {
        try {
          console.log('Search ENS name', query)
          const ensAddress = await getAddressForEns(query)
          if (ensAddress) {
            next({ name: RouteNames.ADDRESS, params: { query: ensAddress } })
            await storeEnsNameForAddress(query, ensAddress)
            return
          } else {
            console.log('No address found at ENS contract')
            next(false)
            return
          }
        } catch (err) {
          console.log('Failed to match an ENS name:', err)
          next(false)
          return
        }
      } else {
        console.log('searchRouteBeforeEnter -> next')
        next(false)
        return
      }
    }
  } else {
    next({ name: RouteNames.BLOCK, params: { query } })
    return
  }

  next()
}

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

const SearchableRoutes = [
  RouteNames.SEARCH,
  RouteNames.BLOCK,
  RouteNames.TRANSACTION,
  RouteNames.ADDRESS,
]

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
      beforeEnter: searchRouteBeforeEnter,
    },

    {
      path: '/blocks',
      name: RouteNames.BLOCKS,
      components: { tabbar: Blocks },
    },
    {
      path: '/block/:query?',
      name: RouteNames.BLOCK,
      component: Block,
    },

    {
      path: '/transactions',
      name: RouteNames.TRANSACTIONS,
      components: { tabbar: Transactions },
      props: { tabbar: { latest: true } },
    },
    {
      path: '/transaction/:query?',
      name: RouteNames.TRANSACTION,
      component: Transaction,
    },

    {
      path: '/address/:query?',
      name: RouteNames.ADDRESS,
      component: Address,
      alias: ['/ens/:query'],
    },

    {
      path: '/richlist',
      name: RouteNames.RICHLIST,
      component: Richlist,
    },

    {
      path: '/producers',
      name: RouteNames.PRODUCERS,
      components: { tabbar: Producers },
    },
  ],
})

router.beforeEach((to, from, next) => {
  if (
    SearchableRoutes.includes(to.name) &&
    typeof to.params.query !== 'undefined' &&
    to.params.query != ''
  ) {
    mutations.setQuery(String(to.params.query))
  } else {
    mutations.setQuery('')
  }

  // preserves the default component mounted
  if (Vue.$isTabbarNavigation(to.name)) {
    const defaultComponent = from.matched[0]
      ? from.matched[0].components.default
      : Home
    to.matched[0].components.default = defaultComponent
  } else {
    mutations.setContentActive(false)
  }

  next()
})

export default router

export { RouteNames }
