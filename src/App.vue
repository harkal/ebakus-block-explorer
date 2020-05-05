<template>
  <div id="app">
    <header ref="header" class="header">
      <div class="container">
        <Header />
        <Search :on-update="updateInnerHeight" />
      </div>
    </header>

    <div class="container content">
      <router-view></router-view>
    </div>

    <Tabbar :tabbar-active="contentActive" />

    <CookiePolicy />
  </div>
</template>

<script>
import debounce from 'lodash/debounce'

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

    this.updateInnerHeight()

    window.addEventListener('resize', debounce(this.updateInnerHeight, 150))

    // fetch USD rate every 5 minutes
    if (process.env.SHOW_PRICE_IN_USD) {
      setInterval(() => {
        fetchUSDConversionRate()
      }, 1000 * 60 * 5)
      fetchUSDConversionRate()
    }
  },
  updated() {
    this.updateInnerHeight()
  },
  methods: {
    updateInnerHeight: function() {
      const self = this
      this.$nextTick(() => {
        if (!self.$refs.header) return

        const height = self.$refs.header.clientHeight * 0.01
        document.documentElement.style.setProperty('--header-vh', `${height}px`)
      })
    },
  },
}
</script>
