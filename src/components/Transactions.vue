<template>
  <div id="transactions-wrapper" class="tab-wrapper">
    <ul v-if="isLoading || txs.length > 0" class="tab-results labels">
      <li class="list-title">
        <span class="col tx-hash">Tx hash</span>
        <span class="col address from">From</span>
        <span v-if="isContractAddress" class="col">Action</span>
        <span v-else class="col address to">To</span>
        <span class="col amount">Amount</span>
        <span class="col time">Time</span>
      </li>
    </ul>
    <div v-if="isLoading || txs.length > 0" class="scroll inner tx">
      <ul class="tab-results main">
        <li
          v-for="index in txs_.length == 0 ? 4 : 0"
          :key="index"
          class="placeholder"
        >
          <span class="mobileLabel">Tx hash</span>
          <span class="col tx-hash transaction">
            <ContentLoader :width="150"
          /></span>
          <span class="mobileLabel">From</span>
          <span class="col address"><ContentLoader :width="150"/></span>
          <img
            v-if="!isContractAddress"
            src="@/assets/img/ic_from_to.png"
            alt
            class="txDirection"
            :class="{ outgoing: false }"
          />
          <span v-if="isContractAddress" class="mobileLabel">Action</span>
          <span v-else class="mobileLabel">To</span>
          <span v-if="isContractAddress" class="col txAction"
            ><ContentLoader :width="150"
          /></span>
          <span v-else class="col address"><ContentLoader :width="150"/></span>
          <span class="mobileLabel">Amount</span>
          <span class="col amount" :class="{ outgoing: false }">
            <ContentLoader :width="50" /> <small>EBK</small>
          </span>
          <span class="mobileLabel">Time</span>
          <span class="col time"><ContentLoader :width="80"/></span>
        </li>
        <li
          v-for="(tx, idx) in txs_"
          :key="tx.hash + ':' + idx"
          :class="{ failed: tx.status === 0 }"
        >
          <span class="mobileLabel">Tx hash</span>
          <span class="col tx-hash transaction">
            <router-link
              :to="{ name: RouteNames.TRANSACTION, params: { query: tx.hash } }"
              :title="tx.hash"
            >
              {{ tx.hash }}
            </router-link>
          </span>
          <span class="mobileLabel">From</span>
          <span class="col address">
            <router-link
              v-if="tx.from !== 'this'"
              :to="{ name: RouteNames.ADDRESS, params: { query: tx.from } }"
              :title="tx.from"
            >
              {{ tx | toENS('from') }}
            </router-link>
            <strong v-else>this</strong>
          </span>
          <img
            v-if="!isContractAddress"
            src="@/assets/img/ic_from_to.png"
            alt
            class="txDirection"
            :class="{ outgoing: tx.from == 'this' && tx.to != 'this' }"
          />
          <span v-if="isContractAddress" class="mobileLabel">Action</span>
          <span v-else class="mobileLabel">To</span>
          <span v-if="isContractAddress" class="col txAction">{{
            tx.inputAction
          }}</span>
          <span v-else class="col address">
            <router-link
              v-if="!['this', 'contract creation'].includes(tx.to)"
              :to="{ name: RouteNames.ADDRESS, params: { query: tx.to } }"
              :title="tx.to"
            >
              {{ tx | toENS('to') }}
            </router-link>
            <router-link
              v-else-if="tx.to === 'contract creation'"
              :to="{
                name: RouteNames.ADDRESS,
                params: { query: tx.contractAddress },
              }"
              :title="tx.contractAddress"
            >
              contract creation
            </router-link>
            <strong v-else>this</strong>
          </span>
          <span class="mobileLabel">Amount</span>
          <span
            class="col amount"
            :class="{
              outgoing: tx.from == 'this' && tx.to != 'this',
              incoming: tx.from !== 'this' && tx.to == 'this',
            }"
            >{{ tx.value | toEtherFixed }} <small>EBK</small></span
          >
          <span class="mobileLabel">Time</span>
          <span class="col time">{{ timeConverter(tx.timestamp) }}</span>
        </li>
      </ul>

      <button
        v-if="numberOfRemainingTxs > 0 || showingLatestTxs"
        class="load-more"
        @click="loadTransactions()"
      >
        Show {{ numberOfRemainingTxs > 0 ? numberOfRemainingTxs : '' }} More
      </button>
    </div>

    <p v-else class="txt-center">
      There are no transactions.
    </p>
  </div>
</template>

<script>
import { RouteNames } from '@/router'
import ContentLoader from './ContentLoader'

import { timeConverter, isZeroHash } from '@/utils'
import { getAbi, decodeDataUsingAbi } from '@/utils/abi'

export default {
  components: {
    ContentLoader,
  },
  props: {
    address: {
      type: String,
      default: '',
    },
    isContractAddress: {
      type: Boolean,
      default: false,
    },
    abi: {
      type: Array,
      default: () => [],
    },
    blockHash: {
      type: String,
      default: '',
    },
    latest: {
      type: Boolean,
      default: false,
    },
    maxOffset: {
      type: Number,
      default: 0,
    },
    updateTxs: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      txs: [],
      offset: 0,
      isLoading: true,
      showTitle: false,
      showingLatestTxs: false,
    }
  },
  computed: {
    RouteNames: () => RouteNames,

    txs_: function() {
      let txs = this.txs
      if (typeof this.address !== 'undefined' && this.address != '') {
        const address = this.address.toLowerCase()
        for (let i = 0; i < txs.length; i++) {
          if (txs[i].from == address) txs[i].from = 'this'
          if (txs[i].to == address) txs[i].to = 'this'
        }
      }
      return txs.map(tx => {
        if (!isZeroHash(tx.contractAddress)) {
          tx.to = 'contract creation'
        }
        return tx
      })
    },
    numberOfRemainingTxs() {
      var remaining = this.maxOffset - 20 - this.offset
      if (remaining > 0) return remaining
      return 0
    },
  },
  watch: {
    $route(to, from) {
      if (to.name !== from.name && this.$isTabbarNavigation(to.name))
        this.reloadFresh()
    },
    address(val, oldVal) {
      if (val !== oldVal) this.reloadFresh()
    },
    blockHash(val, oldVal) {
      if (val !== oldVal) this.reloadFresh()
    },
    txs: function() {
      if (this.txs.length > 0) {
        this.showTitle = true
      }
    },
  },
  created: function() {
    this.loadTransactions()
  },
  methods: {
    timeConverter: timeConverter,

    reloadFresh() {
      this.txs = []
      this.showTitle = false
      this.showingLatestTxs = false
      this.offset = 0

      this.loadTransactions()
    },
    loadTransactions() {
      const self = this

      // get txs for address
      if (typeof this.address !== 'undefined' && this.address != '') {
        const limit = 20
        this.$http
          .get(
            process.env.API_ENDPOINT +
              '/transaction/all/' +
              this.address +
              '?offset=' +
              this.offset +
              '&limit=' +
              limit +
              '&order=desc'
          )
          .then(
            async function(response) {
              this.isLoading = false

              var newTxs = response.data
              if (self.isContractAddress) {
                let abi = this.abi
                if (!abi) {
                  try {
                    abi = await getAbi(self.address)
                  } catch (err) {}
                }

                newTxs.map(tx => {
                  if (tx.input) {
                    const data = decodeDataUsingAbi(abi, tx.input)

                    if (typeof data === 'object' && data.name) {
                      tx.inputAction = `${data.name}(...)`
                    } else {
                      tx.inputAction =
                        tx.input.length > 10
                          ? tx.input.substring(0, 10) + '...'
                          : tx.input
                    }
                  }
                  return tx
                })
              }

              self.txs.push.apply(self.txs, newTxs)
              self.offset += limit

              self.updateTxs(self.txs)
            },
            function(err) {
              console.error(
                `Failed to load transactions for address "${this.address}":`,
                err
              )
              this.isLoading = false
            }
          )

        // get txs for block
      } else if (
        typeof this.blockHash !== 'undefined' &&
        this.blockHash != ''
      ) {
        const limit = 20
        this.$http
          .get(
            process.env.API_ENDPOINT +
              '/transaction/block/' +
              this.blockHash +
              '?offset=' +
              this.offset +
              '&limit=' +
              limit +
              '&order=desc'
          )
          .then(
            function(response) {
              this.isLoading = false

              const newTxs = response.data
              self.txs.push.apply(self.txs, newTxs)
              self.offset += limit
            },
            function(err) {
              console.error(
                `Failed to load transactions for block "${this.blockHash}":`,
                err
              )
              this.isLoading = false
            }
          )
      } else if (this.latest) {
        const limit = 10
        this.$http
          .get(
            process.env.API_ENDPOINT +
              '/transaction/latest?offset=' +
              this.offset +
              '&limit=' +
              limit +
              '&order=desc'
          )
          .then(
            function(response) {
              this.isLoading = false

              const newTxs = response.data
              self.txs.push.apply(self.txs, newTxs)
              self.offset += limit
              self.showingLatestTxs = newTxs.length > 0
            },
            err => {
              console.error('Failed to load latest transactions', err)
              this.isLoading = false
            }
          )
      }
    },
  },
}
</script>

<style scoped lang="scss">
@import '../assets/css/variables';

.txDirection {
  width: 16px;
  vertical-align: 6px;

  @media (max-width: $mobile-grid-breakpoint) {
    display: none;
  }
}

.txAction {
  font-size: 14px;
  font-weight: 700;
}
</style>
