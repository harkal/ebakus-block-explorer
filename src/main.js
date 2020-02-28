import Vue from 'vue'
import vueResource from 'vue-resource'
import VueGtag from 'vue-gtag'

import router from '@/router'

import App from '@/App'
import Transactions from '@/components/Transactions'

Vue.use(vueResource)

// add support for BN in JSON
Vue.http.interceptors.push(function(request) {
  return function(response) {
    response.body = JSON.parse(
      response.bodyText.replace(/:([0-9]{15,}),/g, ':"$1",')
    )
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
    },
    router
  )
}

Vue.component('Transactions', Transactions)

Vue.config.productionTip = process.env.NODE_ENV === 'production'

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
