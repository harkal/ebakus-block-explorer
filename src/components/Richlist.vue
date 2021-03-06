<template>
  <div id="richlist-wrapper" class="page-wrapper">
    <h1><img src="@/assets/img/ic-richlist.svg" alt />Richlist</h1>
    <div class="panel">
      <ul class="tab-results labels">
        <li class="list-title">
          <span class="col id">#</span>
          <span class="col address">Address</span>
          <span class="col amount">Amount</span>
        </li>
      </ul>
      <div class="scroll inner tx">
        <ul class="tab-results main">
          <li
            v-for="index in addresses.length == 0 ? 4 : 0"
            :key="index"
            class="placeholder"
          >
            <span class="mobileLabel">#</span>
            <span class="col id"><ContentLoader :width="14"/></span>
            <span class="mobileLabel">Address</span>
            <span class="col address"> <ContentLoader :width="400"/></span>
            <span class="mobileLabel">Amount</span>
            <span class="col amount"
              ><ContentLoader :width="60" /> <small>EBK</small></span
            >
          </li>
          <li v-for="(data, idx) in addresses" :key="`${data.address}:${idx}`">
            <span class="mobileLabel">#</span>
            <span class="col id">{{ idx + 1 }}</span>
            <span class="mobileLabel">Address</span>
            <span class="col address">
              <router-link
                :to="{
                  name: RouteNames.ADDRESS,
                  params: { query: data.address },
                }"
                :title="data.address"
              >
                {{ data | toENS('address') }}
              </router-link>
            </span>
            <span class="mobileLabel">Amount</span>
            <span class="col amount">
              {{ data.amount | numberFormatterFixed }} <small>EBK</small>
            </span>
          </li>
        </ul>

        <button
          v-if="numberOfRemaining > 0 || isShowingLatest"
          class="load-more"
          @click="loadRichlist()"
        >
          Show {{ numberOfRemaining > 0 ? numberOfRemaining : '' }} More
        </button>
      </div>
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

<style scoped lang="scss">
@import '../assets/css/variables';
.tab-results {
  &.labels {
    margin-top: 0;
  }

  &.main {
    .col {
      &.address {
        text-align: left;
      }

      &.amount {
        text-align: right;
      }
    }
  }
}
</style>
