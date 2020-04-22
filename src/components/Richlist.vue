<template>
  <div id="richlist_wrapper">
    <ul class="tabResults labels">
      <li id="list_title">
        <span class="id">#</span>
        <span class="address">Address</span>
        <span class="amount">Amount</span>
      </li>
    </ul>
    <div class="scroll inner tx">
      <ul class="tabResults main">
        <li
          v-for="index in addresses.length == 0 ? 4 : 0"
          :key="index"
          class="placeholder"
        >
          <span class="mobileLabel">Address</span>
          <span class="address"> <ContentLoader :width="400"/></span>
          <span class="mobileLabel">Amount</span>
          <span class="amount"
            ><ContentLoader :width="150" /> <small>EBK</small></span
          >
        </li>
        <li v-for="(data, idx) in addresses" :key="data.address">
          <span class="mobileLabel">#</span>
          <span class="id">{{ idx + 1 }}</span>
          <span class="mobileLabel">Address</span>
          <span class="address">
            <router-link
              :to="{ name: RouteNames.SEARCH, params: { query: data.address } }"
              :title="data.address"
            >
              {{ data | toENS('address') }}
            </router-link>
          </span>
          <span class="mobileLabel">Amount</span>
          <span class="amount">
            {{ data.amount.toFixed(4) }} <small>EBK</small>
          </span>
        </li>
      </ul>

      <button
        v-if="numberOfRemaining > 0 || isShowingLatest"
        @click="loadRichlist()"
      >
        Show {{ numberOfRemaining > 0 ? numberOfRemaining : '' }} More
      </button>
    </div>
  </div>
</template>

<script>
import { RouteNames } from '@/router'
import ContentLoader from './ContentLoader'

import { isZeroHash } from '../utils'

export default {
  components: {
    ContentLoader,
  },
  data() {
    return {
      addresses: [],
      showTitle: false,
      offset: 0,
      isShowingLatest: false,
    }
  },
  computed: {
    RouteNames: () => RouteNames,

    numberOfRemaining() {
      var remaining = this.maxOffset - 20 - this.offset
      if (remaining > 0) return remaining
      return 0
    },
  },
  watch: {
    $route(to, from) {
      if (to.name !== from.name) this.reloadFresh()
    },
    addresses: function() {
      if (this.addresses.length > 0) {
        this.showTitle = true
      }
    },
  },
  created: function() {
    this.loadRichlist()
  },
  methods: {
    reloadFresh() {
      this.addresses = []
      this.showTitle = false
      this.isShowingLatest = false
      this.offset = 0

      this.loadRichlist()
    },
    loadRichlist() {
      const self = this

      const limit = 20
      this.$http
        .get(
          process.env.API_ENDPOINT +
            '/rich-list?offset=' +
            this.offset +
            '&limit=' +
            limit
        )
        .then(
          function(response) {
            var data = response.data
            self.addresses.push.apply(self.addresses, data)
            self.offset += limit
            self.isShowingLatest = data.length > 0
          },
          err => {
            console.error('Failed to load richlist', err)
          }
        )
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
button {
  position: relative;
  display: block;
  margin-top: 20px;
  border-radius: 10px;
  padding: 20px 25px;
  color: white;
  background: #fe4184;
  font-size: 18px;
  font-weight: 600;
  width: 95%;
  margin: 0 auto 20px;
  transition: 0.5s all ease;
  transform: scale(1);
  border: 0;
  cursor: pointer;
}
*:focus {
  outline: none;
}
button:hover {
  transform: scale(0.98);
}
#richlist_wrapper {
  display: none;
  height: 50px;
  height: 100%;
}
#richlist_wrapper.active {
  opacity: 1;
  display: block;
}
.container {
  margin: 0 auto;
}
ul {
  list-style: none;

  width: 99%;
  max-width: 680px;
  margin: 0 auto;
  padding: 0;
}
li {
  width: 93%;
  margin: 0 auto;
}

.main li {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  align-content: center;
  padding: 22px 1%;
  border-radius: 10px;
  transition: 0.1s all ease-in-out;
  text-decoration: none;
  opacity: 0.85;
}
.main li:hover {
  box-shadow: 0 2px 33px 0 rgba(17, 47, 66, 0.1);
  opacity: 1;
  background: #fff;
}
li span {
  display: inline-block;
  flex: 1 0 auto;
  width: 19%;
  margin: 0 1%;
  text-align: center;
  text-overflow: ellipsis;
  overflow: hidden;
}
#list_title {
  width: 98%;
  padding: 0;
}
#list_title span {
  font-size: 14px;
  color: #828383 !important;
  font-weight: 400;
  opacity: 0.8;
  text-align: center;
}
.id {
  width: 6%;
  text-align: left;
  margin: 0;
  font-weight: 600;
}
span.address {
  width: 60%;
  text-align: left;
}
span.amount {
  width: 30%;
  text-align: right;
}
.scroll {
  overflow: auto;
  height: 100%;
  -webkit-overflow-scrolling: touch;
}
.mobileLabel {
  display: none;
}
@media (max-width: 560px) {
  ul.tabResults.main {
    width: 100%;
  }
  ul.tabResults.main li {
    width: 100%;
    display: block;
  }
  .main li {
    margin-left: 0px;
    margin-bottom: 10px;
    padding-bottom: 45px;
  }

  li {
    position: relative;
    width: 100vw;
    overflow: hidden;
    padding-top: 10px;
    padding-bottom: 15px;
    border-bottom: 2px solid #f0f0f0;
  }
  li span {
    display: block;
    width: 100vw;
    margin: 0;
    text-align: left;
  }

  .id {
    padding-left: 86px;
    font-size: 14px;
  }
  span.address {
    width: 550px;
    width: 75%;
    text-overflow: ellipsis;
    font-size: 14px;
    line-height: 14px;
    padding-left: 86px;
  }
  .tabResults.labels {
    display: none;
  }

  #richlist_wrapper li:last-child {
    padding-bottom: 50px;
  }

  li span.amount {
    display: block;
    position: absolute;
    width: 30%;
    text-align: left;
    padding-left: 86px;
    font-size: 14px;
    white-space: nowrap;
    font-weight: 600;
  }
  a:hover {
    box-shadow: none;
  }
  body {
    -webkit-text-size-adjust: 100%;
  }
  .mobileLabel {
    display: block;
    width: 70px;
    font-size: 13px;
    position: absolute;
    left: 0px;
    padding-left: 10px !important;
    margin-bottom: 10px;
    background: #fff;
  }
}
</style>
