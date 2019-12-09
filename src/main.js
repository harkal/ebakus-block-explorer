import Vue from 'vue'
import vueResource from 'vue-resource'

import router from '@/router'

import App from '@/App'
import Transaction from '@/components/transaction'
import Address from '@/components/address'
import Blocks from '@/components/blocks'
import Transactions from '@/components/transactions'
import Statistics from '@/components/statistics'

Vue.component('address_', Address)
Vue.component('transaction', Transaction)
Vue.component('blocks', Blocks)
Vue.component('transactions', Transactions)
Vue.component('statistics', Statistics)

Vue.use(vueResource)

Vue.config.productionTip = false

var store = {
  debug: true,
  state: {
    loggedIn: true,
    hasNewTweet: false,
    contentActive: false,
    query: '',
    blockHeight: '',
  },
  setLogedIn() {
    if (this.debug) console.log('setLogedIn triggered')
    this.state.loggedIn = true
  },
  setLogedOut() {
    if (this.debug) console.log('setLogedOut triggered')
    this.state.loggedIn = false
  },
  isLogedIn() {
    return this.state.loggedIn
  },
}

new Vue({
  router,
  data: {
    sharedState: store.state,
  },
  render: h => h(App),
}).$mount('#app')
