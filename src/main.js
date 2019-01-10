// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import vueResource from 'vue-resource';
import VueRouter from 'vue-router';

import Transaction from './components/transaction';
import Address from './components/address';
import Blocks from './components/blocks';
import Transactions from './components/transactions';
import Statistics from './components/statistics';

Vue.component('address_', Address);
Vue.component('transaction', Transaction);
Vue.component('blocks', Blocks);
Vue.component('transactions', Transactions);
Vue.component('statistics', Statistics);

Vue.use(vueResource);
Vue.use(VueRouter);

Vue.config.productionTip = false;

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
    if (this.debug) console.log('setLogedIn triggered');
    this.state.loggedIn = true;
  },
  setLogedOut() {
    if (this.debug) console.log('setLogedOut triggered');
    this.state.loggedIn = false;
  },
  isLogedIn() {
    return this.state.loggedIn;
  },
};

const router = new VueRouter({
  mode: 'history',
  base: '/',
  routes: [
    {
      path: '/',
      name: 'App',
      component: App,
    },
    {
      path: '/search/:query',
      name: 'searchTerm',
      component: App,
      props: true,
    },
    {
      path: '/blocks/',
      name: 'blocksList',
      component: App,
      props: { selected: 'blocksTab' },
    },
    {
      path: '/transactions',
      name: 'transactionsList',
      component: App,
      props: { selected: 'transactionsTab' },
    },
    {
      path: '/statistics',
      name: 'statisticsList',
      component: App,
      props: { selected: 'statisticsTab' },
    },
  ],
});

new Vue({
  router,
  data: {
    sharedState: store.state,
  },
  template:
    '<div id="app" class="container"> <router-view>  </router-view> </div>',
}).$mount('#app');
