<template>
  <div id="app" class="container">
    <Search :search-query="searchQuery" :tabbar-active="contentActive" />
    <!-- <router-view></router-view> -->
    <Tabbar :tabbar-active="contentActive" :search-query="searchQuery" />
  </div>
</template>

<script>
import { RouteNames } from '@/router'
import { store } from '@/store'

import Search from './components/Search'
import Tabbar from '@/components/Tabbar'

export default {
  components: {
    Search,
    Tabbar,
  },
  computed: {
    contentActive: () => store.contentActive,
    searchQuery: () => store.searchQuery,
  },
  methods: {
    back() {
      let redirectBack = this.$route.meta.back || '/'
      this.$router.replace(redirectBack, () => {})
    },
  },
}
</script>

<style>
body {
  background: #f8f9fb;
  margin: 0px;
  padding: 0px;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  -webkit-text-size-adjust: none;
}

#app {
  position: relative;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #34393d;
  margin: 30px auto;
  height: 90vh;
}
.container {
  width: 960px;
  height: 100%;
}
.account,
.account a {
  color: #31baf3 !important;
  font-weight: 600;
}

.transaction,
.transaction a {
  color: #615fee !important;
  font-weight: 600;
}
.address {
  font-weight: 600;
  color: #31baf3;
}
h1 {
  font-size: 22px;
}
h2,
h3 {
  margin-bottom: 15px;
  line-height: 18px;
}
h3 {
  font-size: 18px;
}
p {
  margin: 8px 0px;
}
#block_wrapper {
  text-align: left;
  margin-top: 60px;
  transition: 0.3s all ease;
  padding: 0px 5px;
  display: none;
}

.blockMeta {
  background: #fff;
  padding: 10px;
  margin: 20px 0px 60px;
}
a {
  text-decoration: none;
}
img.title_img {
  width: 17px;
}

.panel {
  padding: 30px;
  background: #fff;
  /* Rectangle 4: */
  box-shadow: 0 5px 5px 0 rgba(172, 180, 201, 0.15);
  border-radius: 4px;
  margin: 20px 0px;
}

div.panel h2 {
  margin: 0px 6px 20px 6px;
  color: #acb4c9;
  font-size: 18px;
}

th,
td {
  padding: 4px 6px;
  text-overflow: ellipsis;
  overflow: hidden;
}
td:nth-child(2) {
  font-weight: 500;
}

td.headcol {
  vertical-align: top;
  white-space: nowrap;
}
td.long {
  word-break: break-all;
}
.tabResults {
  list-style: none;
  margin: 30px 0;
  padding: 0;
}
.tabResults.main {
  margin-top: 0px;
  margin-bottom: 20px;
}

#tabbar div.scroll.inner {
  height: calc(100% - 150px) !important;
}

ul.unstyled {
  list-style: none;
  margin: 0;
  padding: 0;
}
ul.unstyled li {
  margin-bottom: 8px;
}
ul.unstyled li:last-child {
  margin-bottom: 0;
}

@media (max-width: 960px) {
  .container {
    width: 100vw;
  }
  #tabbar div.scroll.inner {
    height: calc(100% - 142px) !important;
  }
}
@media (max-width: 560px) {
  #app {
    top: 0px;
    padding: 0px;
    margin: 0px;
    height: 80vh;
  }
  #block_wrapper {
    margin-top: 30px;
  }
  #block_wrapper h1 {
    font-size: 18px;
  }
  #block_wrapper > h1 > img {
    width: 14px;
  }

  .panel {
    padding: 15px;
  }
  .tablewrapper {
    overflow-x: auto;
  }

  td.headcol {
    position: absolute;
    background: #fff;
    width: 75px;
    left: 12px;
    padding-left: 15px;
    top: auto;
    border-top-width: 1px;
    /*only relevant for first row*/
    margin-top: -1px;
    /*compensate for top border*/
    line-height: 20px;
    font-size: 13px;
  }
  td.long {
    padding-left: 90px;
    font-size: 14px;
    line-height: 18px;
  }
  .tabResults.labels {
    display: none;
  }
  .tabResults.main {
    margin-top: 0px;
  }
  #tabbar div.scroll.inner {
    height: calc(100% - 57px) !important;
  }
}
</style>
