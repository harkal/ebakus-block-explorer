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
          <span class="col tx-count transaction">
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
        <li v-if="blocks.length > 0" class="load-more" @click="getNewer()">
          Show newer
        </li>
        <li v-for="block in blocks" :key="block.number">
          <span class="mobileLabel">Block #</span>
          <span class="col block-number">
            <router-link
              :to="{
                name: RouteNames.BLOCK,
                params: { query: String(block.number) },
              }"
            >
              {{ block.number }}
            </router-link>
          </span>
          <span class="mobileLabel">Tx count</span>
          <span class="col tx-count transaction">
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
                name: RouteNames.ADDRESS,
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
        <li
          v-if="oldestBlockNumber > 0"
          :disabled="isLoading"
          class="load-more"
          @click="getOlder()"
        >
          Show older
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

const BLOCKS_OFFSET_RANGE = 10

export default {
  components: {
    ContentLoader,
  },
  data() {
    return {
      blocks: [],
      showTitle: false,
      isLoading: false,
    }
  },
  computed: {
    RouteNames: () => RouteNames,
    newestBlockNumber: function() {
      const newestBlock = this.blocks[0]
      return newestBlock ? newestBlock.number : 0
    },
    oldestBlockNumber: function() {
      const oldestBlock = this.blocks[this.blocks.length - 1]
      return oldestBlock ? oldestBlock.number : 0
    },
  },
  watch: {
    $route(to, from) {
      if (to.name !== from.name && to.name === RouteNames.BLOCKS)
        this.getLatest()
    },
    blocks: function() {
      if (this.blocks.length > 0) {
        this.showTitle = true
      }
    },
  },
  created: function() {
    this.getLatest()
  },
  methods: {
    timeConverter: timeConverter,
    fetchBlocks: async function(lookupBlockNumber = '-1') {
      this.isLoading = true

      try {
        const res = await this.$http.get(
          process.env.API_ENDPOINT +
            '/block/' +
            lookupBlockNumber +
            '?range=' +
            BLOCKS_OFFSET_RANGE
        )
        this.isLoading = false

        return res.data
      } catch (err) {
        console.error('Failed to fetch blocks', err)
        this.isLoading = false
      }
    },
    getLatest: async function() {
      if (this.isLoading) return

      const latestBlocks = await this.fetchBlocks('-1')
      this.blocks = latestBlocks

      mutations.setBlockHeight(this.blocks[0].number)
    },
    getNewer: async function() {
      if (this.isLoading) return

      const latestBlock = this.newestBlockNumber
      const lookupBlock = latestBlock + BLOCKS_OFFSET_RANGE

      const newerBlocks = await this.fetchBlocks(lookupBlock)

      const newerBlocksFiltered = newerBlocks.filter(
        bl => bl.number > latestBlock
      )
      if (newerBlocksFiltered.length > 0) {
        this.blocks.unshift(...newerBlocksFiltered)
      }
    },
    getOlder: async function() {
      if (this.isLoading) return

      const olderBlock = this.oldestBlockNumber
      const lookupBlock = olderBlock - 1

      const olderBlocks = await this.fetchBlocks(lookupBlock)

      this.blocks.push(...olderBlocks)
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
  background: #95a0a7;

  &::-webkit-progress-bar {
    background: #f0f0f0;
  }

  &::-webkit-progress-value {
    background: #95a0a7;
  }

  &::-moz-progress-bar {
    background: #fff;
  }

  @media (max-width: $mobile-grid-breakpoint) {
    margin-left: 0;
  }
}
</style>
