import Vue from 'vue'
import Web3 from 'web3'
import floor from 'lodash/floor'
import vueResource from 'vue-resource'
import VueGtag from 'vue-gtag'

import router, { RouteNames } from '@/router'
import App from '@/App'
import VPureTooltip from '@/directives/v-pure-tooltip'
import Transactions from '@/components/Transactions'
import { store } from './store'

import '@/assets/css/main.scss'

Vue.use(vueResource)
Vue.use(VPureTooltip)

// add support for BN in JSON
Vue.http.interceptors.push(function(request) {
  return function(response) {
    if (response.ok) {
      response.body = JSON.parse(
        response.bodyText.replace(/:([0-9]{15,}),/g, ':"$1",')
      )
    }
  }
})

if (process.env.NODE_ENV === 'production' && process.env.GOOGLE_TRACKING_ID) {
  Vue.use(
    VueGtag,
    {
      config: {
        id: process.env.GOOGLE_TRACKING_ID,
        params: {
          cookie_domain:
            process.env.GOOGLE_TRACKING_COOKIE_DOMAIN || 'explorer.ebakus.com',
        },
      },
      bootstrap: false,
    },
    router
  )
}

Vue.component('Transactions', Transactions)

Vue.config.productionTip = process.env.NODE_ENV === 'production'

const defaultLocale =
  (navigator.languages && navigator.languages[0]) ||
  navigator.language ||
  navigator.userLanguage ||
  'en-GB'

const numberFormatter = window.Intl
  ? new Intl.NumberFormat(defaultLocale)
  : { format: num => num }

Vue.filter('numberFormatter', function(num) {
  return numberFormatter.format(num)
})

const numberFormatterFixed = window.Intl
  ? new Intl.NumberFormat(defaultLocale, {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    })
  : { format: num => floor(parseFloat(num), 4).toFixed(4) }

Vue.filter('numberFormatterFixed', function(num) {
  return numberFormatterFixed.format(num)
})

Vue.filter('toFixed', function(price, limit = 4) {
  return price.toFixed(limit)
})

Vue.filter('floor', function(number) {
  return floor(number, 4)
})

const toEther = (wei, withoutFormat = false) => {
  if (typeof wei == 'number') {
    wei = '0x' + wei.toString(16)
  }

  const ether = Web3.utils.fromWei(wei)
  return withoutFormat ? ether : numberFormatter.format(ether)
}
Vue.filter('toEther', toEther)

Vue.filter('toEtherFixed', function(wei, withoutFormat = false) {
  if (typeof wei == 'number') {
    wei = '0x' + wei.toString(16)
  }

  const ether = Web3.utils.fromWei(wei)
  return withoutFormat ? ether : numberFormatterFixed.format(ether)
})

Vue.filter('toENS', function(obj, field) {
  return !!obj[`${field}Ens`] ? obj[`${field}Ens`] : obj[field]
})

const toUSDString = (amount, symbol = 'USD') => {
  if (
    !process.env.SHOW_PRICE_IN_USD ||
    amount <= 0 ||
    !store.usdRate ||
    isNaN(amount)
  ) {
    return ''
  }

  const usd = amount * store.usdRate
  let out = numberFormatterFixed.format(usd)
  if (symbol) out += ` ${symbol}`
  return `${out}`
}
Vue.filter('toUSDString', toUSDString)

Vue.filter('weiToUSDString', function(wei, symbol = 'USD') {
  const ether = toEther(wei, true)
  return toUSDString(ether, symbol)
})

const isTabbarNavigation = function(routeName = router.app.$route.name) {
  return [
    RouteNames.BLOCKS,
    RouteNames.TRANSACTIONS,
    RouteNames.PRODUCERS,
  ].includes(routeName)
}

Vue.$isTabbarNavigation = isTabbarNavigation
Vue.prototype.$isTabbarNavigation = isTabbarNavigation

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
