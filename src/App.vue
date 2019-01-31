<template>
  <div>
    <search :r-query-str="query" :tabbar-active="contentActive"></search>
    <tabbar
      :tabbar-active="contentActive"
      :selected-by-route="selected"
    ></tabbar>
  </div>
</template>

<script>
import search from './components/search'
import tabbar from './components/tabbar'

export default {
  name: 'App',
  components: {
    search,
    tabbar,
  },
  props: {
    query: {
      type: String,
      default: '',
    },
    selected: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      contentActive: false,
    }
  },
  computed: {
    vueContentActive() {
      return this.$root.$data.sharedState.contentActive
    },
  },
  watch: {
    vueContentActive: function() {
      this.contentActive = this.vueContentActive
    },
    query: function() {
      console.log('test')
      if (this.query != '') this.$root.$data.sharedState.query = this.query
    },
  },
  created: function() {
    //console.log(this.vueSharedState.contentActive)
    //document.addEventListener('backbutton', this.back(), false);
    this.contentActive = this.$root.$data.sharedState.contentActive
    if (this.query != '') this.$root.$data.sharedState.query = this.query
  },
  beforeDestroy() {
    //document.removeEventListener("backbutton", this.back);
  },
  methods: {
    back() {
      console.log('back')
      back = back ? back : this.$route.meta.back
      back ? this.$router.replace(back) : this.$router.replace('/')
    },
  },

  beforeRouteLeave: (to, from, next) => {
    console.log(to)
    console.log(from)
    if (!to.meta.back) {
      to.meta.back = from.fullpath
    }
    next()
  },
  beforeRouteEnter: (to, from, next) => {
    console.log(to)
    console.log(from)
    if (!to.meta.back) {
      to.meta.back = from.fullpath
    }
    next()
    // ...
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

#tabbar div.scroll.tx {
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
}
</style>
