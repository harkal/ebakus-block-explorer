<template>
  <div id="app">
    <header class="header">
      <div class="container">
        <Header />
        <!-- <Search :search-query="searchQuery" :tabbar-active="contentActive" /> -->
        <Search :search-query="searchQuery" :tabbar-active="false" />
      </div>
    </header>

    <div class="container content">
      <router-view></router-view>
    </div>
    <Tabbar :search-query="searchQuery" :tabbar-active="contentActive" />

    <CookiePolicy />
  </div>
</template>

<script>
import { RouteNames } from '@/router'
import { store } from '@/store'
import { fetchUSDConversionRate } from '@/utils/api'
import { initWeb3 } from '@/utils/web3ebakus'

import Header from '@/components/Header'
import Search from '@/components/Search'
import Tabbar from '@/components/Tabbar'
import CookiePolicy from '@/components/CookiePolicy'

export default {
  components: {
    Header,
    Search,
    Tabbar,
    CookiePolicy,
  },
  computed: {
    contentActive: () => store.contentActive,
    searchQuery: () => store.searchQuery,
  },
  created() {
    initWeb3()

    // fetch USD rate every 5 minutes
    if (process.env.SHOW_PRICE_IN_USD) {
      setInterval(() => {
        fetchUSDConversionRate()
      }, 1000 * 60 * 5)
      fetchUSDConversionRate()
    }
  },
}
</script>
