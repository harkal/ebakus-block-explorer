<template>
  <div class="page-wrapper">
    <h1><img src="@/assets/img/ic-block.svg" alt />Block</h1>
    <div class="panel">
      <div class="widget-wrapper">
        <div class="widget">
          <img src="@/assets/img/ic-block.svg" alt />
          <h3>BLOCK #</h3>
          <router-link
            class="nav-button left"
            :to="{ name: RouteNames.BLOCK, params: { query: previousBlock } }"
          >
            <img src="@/assets/img/ic-left-arrow.svg" alt />
          </router-link>
          <router-link
            class="nav-button right"
            :to="{ name: RouteNames.BLOCK, params: { query: nextBlock } }"
          >
            <img src="@/assets/img/ic-right-arrow.svg" alt />
          </router-link>
          <h2 v-if="block.number">{{ block.number }}</h2>
          <ContentLoader v-else :width="100" :height="20" />
        </div>

        <div class="widget">
          <img src="@/assets/img/ic-transaction.svg" alt />
          <h3>TRANSACTIONS</h3>
          <h2 v-if="block.transactionCount >= 0">
            {{ block.transactionCount }}
          </h2>
          <ContentLoader v-else :width="100" :height="20" />
        </div>
        <div class="widget">
          <img src="@/assets/img/ic-gas.svg" alt />
          <h3>GAS USED</h3>
          <h2 v-if="block.gasUsed >= 0">{{ gasUsed }}%</h2>
          <ContentLoader v-else :width="100" :height="20" />
          <progress :value="gasUsed" max="100">{{ gasUsed }}%</progress>
        </div>
      </div>
    </div>
    <div class="panel">
      <h2>Details</h2>
      <div class="table-wrapper">
        <table>
          <tr>
            <td class="headcol">Hash</td>
            <td class="long">
              <strong v-if="hasData">{{ block.hash }}</strong>
              <ContentLoader v-else :width="300" />
            </td>
          </tr>
          <tr>
            <td class="headcol">Size</td>
            <td class="long">
              <strong v-if="hasData">{{ size }}</strong>
              <ContentLoader v-else :width="100" />
            </td>
          </tr>
          <tr>
            <td class="headcol">Timestamp</td>
            <td class="long">
              <span v-if="hasData">{{ timeConverter(block.timestamp) }}</span>
              <ContentLoader v-else :width="100" />
            </td>
          </tr>
          <tr>
            <td class="headcol">Produced by</td>
            <td class="long">
              <span v-if="hasData" class="address">
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
              <ContentLoader v-else :width="300" />
            </td>
          </tr>
          <tr>
            <td class="headcol">Gas used</td>
            <td class="long">
              <span v-if="hasData">{{ block.gasUsed }}</span>
              <ContentLoader v-else :width="100" />
            </td>
          </tr>
          <tr>
            <td class="headcol">Gas limit</td>
            <td class="long">
              <span v-if="hasData">{{ block.gasLimit }}</span>
              <ContentLoader v-else :width="100" />
            </td>
          </tr>
          <tr>
            <td class="headcol">Tx Root</td>
            <td class="long">
              <span v-if="hasData">{{ block.transactionsRoot }}</span>
              <ContentLoader v-else :width="300" />
            </td>
          </tr>
          <tr>
            <td class="headcol">Parent Hash</td>
            <td class="long">
              <span v-if="hasData">{{ block.parentHash }}</span>
              <ContentLoader v-else :width="300" />
            </td>
          </tr>
          <tr>
            <td class="headcol">Delegates</td>
            <td class="long">
              <ul v-if="hasData" class="unstyled">
                <li
                  v-for="(delegate, idx) in block.delegates"
                  :key="idx"
                  class="address"
                >
                  <router-link
                    :to="{
                      name: RouteNames.ADDRESS,
                      params: { query: delegate },
                    }"
                    >{{ delegate }}</router-link
                  >
                </li>
              </ul>
              <ContentLoader v-else :width="300" :height="48" />
            </td>
          </tr>
        </table>
      </div>
    </div>

    <div v-if="block.hash && txs.length > 0" class="panel">
      <h2>Transactions</h2>
      <Transactions
        :class="{ active: true }"
        :max-offset="block.transactionCount"
        :block-hash="block.hash"
        :txs="txs"
      />
    </div>
  </div>
</template>

<script>
import ContentLoader from './ContentLoader'
import Transactions from './Transactions'
import { RouteNames } from '@/router'
import { store, mutations } from '@/store'
import { timeConverter } from '@/utils'

export default {
  components: {
    ContentLoader,
    Transactions,
  },
  data() {
    return {
      previousBlock: 1,
      nextBlock: 0,

      block: {},
      txs: [],
    }
  },
  computed: {
    RouteNames: () => RouteNames,

    blockHeight: () => store.blockHeight,
    searchQuery: () => store.searchQuery,

    gasUsed: function() {
      if (this.block.gasLimit > 0 && this.block.gasUsed > 0)
        return ((this.block.gasUsed / this.block.gasLimit) * 100).toFixed(1)
      else return 0
    },
    gasUsedCss: function() {
      return 'width: ' + this.gasUsed + '%;'
    },
    size() {
      if (parseFloat(this.block.size) >= 1024)
        return this.block.size / 1024 + 'KB'
      else if (parseFloat(this.block.size) > 1048576)
        return this.block.size / 1048576 + 'MB'
      else return this.block.size + ' Bytes'
    },
    hasData() {
      return !!this.block.hash
    },
  },
  watch: {
    searchQuery: function(val, oldVal) {
      if (val !== oldVal) {
        this.search()
      }
    },
    block: function() {
      if (this.block.number > 0) {
        this.previousBlock = (this.block.number - 1).toString()
      }
      this.nextBlock = (this.block.number + 1).toString()
    },
  },
  created: function() {
    this.search()
  },
  methods: {
    timeConverter: timeConverter,

    search: function() {
      if (typeof this.searchQuery !== 'undefined' && this.searchQuery) {
        const block = this.searchQuery.replace(/ /g, '')
        this.getBlock(block)
      }
    },

    getBlock: function(blockID) {
      this.txs = []

      this.$http.get(process.env.API_ENDPOINT + '/block/' + blockID).then(
        function(response) {
          this.block = response.data

          if (this.block.number >= 0) {
            if (store.blockHeight < this.block.number) {
              mutations.setBlockHeight(this.block.number)
            }

            this.$http
              .get(
                process.env.API_ENDPOINT +
                  '/transaction/block/' +
                  this.block.hash
              )
              .then(
                function(response) {
                  this.txs = response.data
                },
                err => {
                  console.error(
                    `Failed to fetch transactions for block "${this.block.hash}": `,
                    err
                  )
                }
              )
          }
        },
        err => {
          console.error(`Failed to fetch block "${blockID}": `, err)
          this.error = 'Failed to get block.'
        }
      )
    },
  },
}
</script>

<style scoped lang="scss">
@import '../assets/css/variables';

// .widget {
//   a.left-arrow {
//     position: absolute;
//     top: 34px;
//     left: 30px;
//   }
//   a.right-arrow {
//     position: absolute;
//     top: 34px;
//     right: 30px;
//   }
// }

progress {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
}

@media (max-width: $mobile-grid-breakpoint) {
  .loader {
    padding: 0 5% !important;
  }
}
</style>
