<template>
  <div id="blocks-wrapper" class="tab-wrapper">
    <ul class="tab-results labels">
      <li class="list-title">
        <span class="col block-number">Block #</span>
        <span class="col tx-count">Transactions</span>
        <span class="col gas-used">Gas used</span>
        <span class="col address">Produced by</span>
        <span class="col time">Time</span>
      </li>
    </ul>
    <div class="scroll inner">
      <ul class="tab-results main">
        <li
          v-for="index in blocks.length == 0 ? 4 : 0"
          :key="index"
          class="placeholder"
        >
          <span class="mobileLabel">Block #</span>
          <span class="col block-number"><ContentLoader :width="90"/></span>
          <span class="mobileLabel">Tx count</span>
          <span class="col tx-count">
            <strong><ContentLoader :width="14" fixed/></strong> transactions
          </span>
          <span class="mobileLabel">Gas used</span>
          <span class="col gas-used">
            <progress :value="0" max="100">0 %</progress>
          </span>
          <span class="mobileLabel">Produced by</span>
          <span class="col address"><ContentLoader :width="120"/></span>
          <span class="mobileLabel">Timestamp</span>
          <span class="col time"><ContentLoader :width="80"/></span>
        </li>
        <li v-for="block in blocks" :key="block.number">
          <span class="mobileLabel">Block #</span>
          <span class="col block-number">
            <router-link
              :to="{
                name: RouteNames.SEARCH,
                params: { query: String(block.number) },
              }"
            >
              {{ block.number }}
            </router-link>
          </span>
          <span class="mobileLabel">Tx count</span>
          <span class="col tx-count">
            <strong>{{ block.transactionCount }}</strong> transactions
          </span>
          <span class="mobileLabel">Gas used</span>
          <span class="col gas-used">
            <progress :value="block.gasUsed" max="100">
              {{ block.gasUsed }} %
            </progress>
          </span>
          <span class="mobileLabel">Produced by</span>
          <span class="col address">
            <router-link
              :to="{
                name: RouteNames.SEARCH,
                params: { query: block.producer },
              }"
              :title="block.producer"
            >
              {{ block | toENS('producer') }}
            </router-link>
          </span>
          <span class="mobileLabel">Timestamp</span>
          <span class="col time">{{ timeConverter(block.timestamp) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mutations } from '@/store'
import { RouteNames } from '@/router'
import { timeConverter } from '@/utils'

import ContentLoader from './ContentLoader'

export default {
  components: {
    ContentLoader,
  },
  data() {
    return {
      showTitle: false,
      blocks: [],
    }
  },
  computed: {
    RouteNames: () => RouteNames,
  },
  watch: {
    $route(to, from) {
      if (to.name !== from.name && to.name === RouteNames.BLOCKS)
        this.getLatestBlocks()
    },
    blocks: function() {
      if (this.blocks.length > 0) {
        this.showTitle = true
      }
    },
  },
  created: function() {
    this.getLatestBlocks()
  },
  methods: {
    timeConverter: timeConverter,
    getLatestBlocks: async function() {
      try {
        const res = await this.$http.get(
          process.env.API_ENDPOINT + '/block/-1?range=10'
        )

        this.blocks = res.data

        mutations.setBlockHeight(this.blocks[0].number)
      } catch (err) {
        console.error('Failed to load latest blocks', err)
      }
    },
  },
}
</script>

<style scoped lang="scss">
@import '../assets/css/variables';

.col {
  &.tx-count {
    font-weight: 300;
    white-space: nowrap;
  }

  &.gas-used {
    width: 150px;
    margin: 0 8px;

    @media (max-width: $mobile-grid-breakpoint) {
      width: 100vw;
      margin: 0px;
    }
  }
}

progress {
  margin: 0 $spacer-2;
}
</style>
