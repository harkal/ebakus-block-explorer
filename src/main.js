import Vue from 'vue'
import vueResource from 'vue-resource'

import router from '@/router'

import App from '@/App'
import Transactions from '@/components/Transactions'

Vue.use(vueResource)

Vue.component('Transactions', Transactions)

Vue.config.productionTip = process.env.NODE_ENV === 'production'

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
