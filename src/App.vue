<template>
  <div id="app" class="container">
    <Search :search-query="searchQuery" :tabbar-active="contentActive" />
    <!-- <router-view></router-view> -->
    <Tabbar :search-query="searchQuery" :tabbar-active="contentActive" />
    <CookiePolicy />
  </div>
</template>

<script>
import { RouteNames } from '@/router'
import { store } from '@/store'
import { fetchUSDConversionRate } from '@/utils/api'
import { initWeb3 } from '@/utils/web3ebakus'

import Search from '@/components/Search'
import Tabbar from '@/components/Tabbar'
import CookiePolicy from '@/components/CookiePolicy'

export default {
  components: {
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
