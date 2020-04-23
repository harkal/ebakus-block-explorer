import Vue from 'vue'
import Web3 from 'web3'
import floor from 'lodash/floor'
import vueResource from 'vue-resource'
import VueGtag from 'vue-gtag'

import router from '@/router'
import App from '@/App'
import Transactions from '@/components/Transactions'
import { store } from './store'

Vue.use(vueResource)

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

Vue.filter('toFixed', function(price, limit = 4) {
  return price.toFixed(limit)
})

Vue.filter('floor', function(number) {
  return floor(number, 4)
})

const toEther = wei => {
  if (typeof wei == 'number') {
    wei = '0x' + wei.toString(16)
  }

  return Web3.utils.fromWei(wei)
}
Vue.filter('toEther', toEther)

Vue.filter('toEtherFixed', function(wei) {
  if (typeof wei == 'number') {
    wei = '0x' + wei.toString(16)
  }

  return floor(parseFloat(Web3.utils.fromWei(wei)), 4).toFixed(4)
})

Vue.filter('toENS', function(obj, field) {
  return !!obj[`${field}Ens`] ? obj[`${field}Ens`] : obj[field]
})

Vue.filter('weiToUSDString', function(wei, symbol = 'USD') {
  if (!process.env.SHOW_PRICE_IN_USD || wei <= 0 || !store.usdRate) {
    return ''
  }

  const ether = toEther(wei)
  const usd = ether * store.usdRate
  let out = floor(parseFloat(usd), 4).toFixed(4)
  if (symbol) out += ` ${symbol}`
  return `${out}`
})

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
