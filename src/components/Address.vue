<template>
  <div class="page-wrapper">
    <h1 v-if="address.isContract">
      <img src="@/assets/img/ic-contract.svg" alt />Contract
    </h1>
    <h1 v-else>
      <img
        src="@/assets/img/ic-ens.png"
        srcset="@/assets/img/ic-ens@2x.png 2x, @/assets/img/ic-ens@3x.png 3x"
        alt
      />
      Address
    </h1>

    <div
      class="panel panel-collapsable actions"
      :class="{ collapsed: !address.isContract || abi.length === 0 }"
    >
      <h2>Actions</h2>

      <div>
        <a
          class="button"
          :href="downloadAbiContent.data"
          :download="downloadAbiContent.filename"
        >
          <img src="@/assets/img/ic-abi.svg" alt />
          Get ABI
        </a>
        <!-- <a class="button">
          <img src="@/assets/img/ic-remix.svg" alt />Interact with contract
        </a> -->
      </div>
    </div>
    <div class="panel">
      <h2>Address</h2>

      <div class="valignCenter">
        <div v-if="!!address.addressEns" class="twocol ens">
          <p class="title">{{ address.addressEns }}</p>
          <span class="address">{{ address.address }}</span>
        </div>
        <div v-else class="twocol">
          <span v-if="address.address" class="address">
            {{ address.address }}
          </span>
          <ContentLoader v-else :width="400" />
        </div>
        <div class="twocol right balances">
          <span class="balanceLabel">Liquid balance</span>
          <span v-if="hasData" v-pure-tooltip="balanceInUSD" class="balance">{{
            address.balance | toEtherFixed
          }}</span>
          <ContentLoader v-else :width="84" :height="20" />
          <small> EBK</small>
          <br />
          <span class="balanceLabel">Staked balance</span>
          <span
            v-if="hasData"
            v-pure-tooltip.down="stakeInUSD"
            class="balance"
            >{{ (address.stake / 10000).toFixed(4) }}</span
          >
          <ContentLoader v-else :width="84" :height="20" />
          <small> EBK</small>
        </div>
      </div>
      <div
        v-if="!chartDataLoaded || address.block_rewards == 0"
        class="chart-wrapper"
      >
        <Chart v-if="chartDataLoaded" :chart-data="balanceData" :height="300" />
        <ContentLoader v-else :width="1000" :height="300" />
      </div>
    </div>

    <div
      class="panel panel-collapsable"
      :class="{ collapsed: !statsData || !statsData.stake }"
    >
      <h2>Producer Info</h2>
      <table>
        <tr>
          <td class="headcol">Block rewards</td>
          <td>
            <span v-if="address.block_rewards">{{
              address.block_rewards | toEtherFixed
            }}</span>
            <ContentLoader v-else :width="60" />
            <small> EBK</small>
          </td>
        </tr>
        <tr>
          <td class="headcol">Votes</td>
          <td>
            <span v-if="statsData && statsData.stake">{{
              statsData.stake / 10000
            }}</span>
            <ContentLoader v-else :width="60" />
            <small> EBK</small>
          </td>
        </tr>
        <!-- <tr>
          <td colspan="2">
            <table class="missedBlocks">
              <tr>
                <th>&nbsp;</th>
                <th v-for="(label, idx) in statsData.labels" :key="idx">
                  {{ label }}
                </th>
              </tr>
              <tr>
                <td>Missed blocks</td>
                <td
                  v-for="(stats, idx) in statsData.data"
                  :key="idx"
                  :class="{ txt-danger: stats.missedBlocks > 0 }"
                >
                  {{ stats.missedBlocks }}
                </td>
              </tr>
              <tr>
                <td>Density</td>
                <td v-for="(stats, idx) in statsData.data" :key="idx">
                  {{ stats.density.toFixed(2) }}%
                </td>
              </tr>
            </table>
          </td>
        </tr>-->
      </table>
    </div>

    <div class="panel">
      <h2>Transactions</h2>
      <Transactions
        :key="`txs-for-address-${address.address}`"
        :address="address.address"
        :is-contract-address="address.isContract"
        :abi="abi"
        :max-offset="address.tx_count"
        :class="{ active: txs.length > 0 }"
      />
    </div>
  </div>
</template>

<script>
import Web3 from 'web3'

import { store } from '@/store'
import { timeConverter } from '@/utils'
import { getAbi } from '@/utils/abi'

import Chart from './Chart'
import ContentLoader from './ContentLoader'

export default {
  components: {
    ContentLoader,
    Chart,
  },
  data() {
    return {
      address: {},
      txs: [],
      abi: [],
      chartDataLoaded: false,
    }
  },
  computed: {
    searchQuery: () => store.searchQuery,
    hasData() {
      return !!this.address.address
    },
    balanceData: function() {
      const data = this.address
      if (!data || !data.address) return

      const BN = Web3.utils.BN

      var i
      var balance = new BN('0')
      var balanceData = {}
      var _data = []
      var _datasets = []
      var _labels = []
      var txs = this.txs.slice().reverse()

      for (i = 0; i < txs.length; i++) {
        _labels.push(this.timeConverter(txs[i].timestamp))

        if (
          [data.address, 'this'].includes(txs[i].from) &&
          txs[i].to != 'this'
        ) {
          balance = balance.sub(new BN(String(txs[i].value)))
        } else if (
          txs[i].from != 'this' &&
          [data.address, 'this'].includes(txs[i].to)
        ) {
          balance = balance.add(new BN(String(txs[i].value)))
        }

        _data.push(balance)
      }

      _labels.unshift('')
      balance = new BN(String(data.balance)).add(
        new BN(String(data.stake)).mul(new BN(100000000000000))
      )

      if (txs.length > 0) {
        balance = balance.sub(_data[txs.length - 1])
      }

      for (i = 0; i < txs.length; i++) {
        _data[i] = _data[i].add(balance)
      }
      _data.unshift(balance)

      // TODO: remove this. cap lower value to 0
      _data = _data.map(value => (value.lt(new BN('0')) ? new BN('0') : value))

      // now that we finished with number calcs, keep 4 decimals (converts to string)
      _data = _data.map(value => this.$options.filters.toEtherFixed(value))

      _datasets = [
        {
          label: 'Balance',
          backgroundColor: '#E4F5FD',
          borderColor: '#31BAF3',
          data: _data,
        },
      ]

      balanceData = {
        labels: _labels,
        datasets: _datasets,
      }

      return balanceData
    },
    balanceInUSD: function() {
      return !!this.address.balance
        ? this.$options.filters.weiToUSDString(this.address.balance)
        : {}
    },
    stakeInUSD: function() {
      return !!this.address.stake
        ? this.$options.filters.toUSDString(
            (this.address.stake / 10000).toFixed(4)
          )
        : {}
    },
    statsData: function() {
      if (typeof this.address.stats === 'undefined') return {}

      const [delegateInfo, ...rest] = this.address.stats.delegates.filter(
        delegate => {
          const lastPeriod = delegate[delegate.length - 1]
          return lastPeriod.address === this.address.address
        }
      )

      if (!delegateInfo) {
        return
      }

      const labels = []
      const data = delegateInfo.map(period => {
        let label = 'minutes'
        let time = period.seconds_examined / 60
        if (time >= 60) {
          label = 'hour'
          time = 60 / 60
        }
        labels.push(`${time} ${label}`)

        return {
          missedBlocks: period.missed_blocks,
          density: period.density * 100,
        }
      })

      return {
        labels,
        data,
        // get stake from any period, it's the same
        stake: delegateInfo[delegateInfo.length - 1].stake,
      }
    },
    downloadAbiContent: function() {
      return {
        data:
          'data:text/json;charset=utf-8,' +
          encodeURIComponent(JSON.stringify(this.abi, 0, 2)),
        filename: `${this.address.address}-abi.json`,
      }
    },
  },
  watch: {
    searchQuery: function(val, oldVal) {
      if (val !== oldVal) {
        this.search()
      }
    },
    // address: function() {},
    txs: function() {
      this.chartDataLoaded = true
    },
  },
  created: function() {
    this.search()
  },
  methods: {
    timeConverter: timeConverter,

    search: function() {
      if (typeof this.searchQuery !== 'undefined' && this.searchQuery) {
        this.address = {}
        this.txs = []

        const address = this.searchQuery.replace(/ /g, '')
        this.getAddress(address)
      }
    },

    getAddress: function(address) {
      const self = this

      this.txs = []

      this.$http.get(process.env.API_ENDPOINT + '/address/' + address).then(
        function(response) {
          this.address = response.data

          if (this.address.isContract) {
            getAbi(this.address.address).then(function(abi) {
              self.$set(self, 'abi', abi)
            })
          }

          if (this.address.block_rewards > 0) {
            // extra API call to retrieve block producer, later this will be returned by the API tx call itself
            this.$http.get(process.env.API_ENDPOINT + '/stats/' + address).then(
              function(response) {
                this.$set(this.address, 'stats', response.data)
              },
              function(err) {
                console.error(
                  `Failed to fetch stats for address "${address}": `,
                  err
                )
              }
            )
          }
        },
        function(err) {
          console.error(`Failed to fetch address info for "${address}": `, err)
          this.error = 'Failed to get address informations.'
        }
      )

      this.$http
        .get(
          process.env.API_ENDPOINT +
            '/transaction/all/' +
            address +
            '?offset=0&limit=20&order=desc'
        )
        .then(
          function(response) {
            this.$set(this, 'txs', response.data)
          },
          function(err) {
            console.error(
              `Failed to fetch transactions for address "${address}": `,
              err
            )
          }
        )
    },
  },
}
</script>

<style scoped lang="scss">
@import '../assets/css/variables';

.ens {
  .title {
    margin: 2px 0 15px 0;
    font-size: 18px;
    font-weight: 700;
  }

  .address {
    color: #acb4c9;
  }
}

.valignCenter {
  @media (max-width: 640px) {
    display: block;
  }
}

.twocol {
  display: inline-block;
  width: 49%;

  &.right {
    text-align: right;
  }

  // & > .address {
  //   padding-left: 7px;
  // }

  @media (max-width: 640px) {
    display: block;

    width: 100%;
    margin: 0;
    padding: $spacer-2 0;
    // overflow-x: auto;

    &.right {
      text-align: left;
    }

    .address {
      padding-left: 0;
      font-size: 14px;
    }
  }
}

.actions {
  button,
  .button {
    margin-right: $spacer-3;
    color: #112f42;
    font-size: 18px;
    font-weight: 700;

    img {
      margin-right: $spacer-2;
      vertical-align: -6px;
    }

    @media (max-width: $mobile-grid-breakpoint) {
      margin-bottom: $spacer-2;

      font-size: 14px;

      &:last-child {
        margin-bottom: 0;
      }

      img {
        width: 20px;
      }
    }
  }
}

.balances small {
  font-weight: 700;
}

.balance {
  font-size: 28px;
  font-weight: 700;
}

.balanceLabel {
  margin-right: 10px;
  font-size: 17px;
  font-weight: 400;
  color: #acb4c9;
}

.chart-wrapper {
  position: relative;
  width: 100% !important;
  padding-top: 40px;
  overflow: hidden;

  @media (max-width: $mobile-grid-breakpoint) {
    padding-top: 10px;
  }
}

.missedBlocks {
  margin: -4px -6px;

  th:first-child {
    min-width: 150px;

    @media (max-width: $mobile-grid-breakpoint) {
      min-width: auto;
    }
  }

  th:not(:first-child),
  td:not(:first-child) {
    text-align: right;
  }
}
</style>
