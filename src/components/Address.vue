<template>
  <div id="block_wrapper">
    <h1>Address</h1>

    <div class="panel">
      <div class="valignCenter">
        <div v-if="!!addressData.addressEns" class="twocol ens">
          <p class="title">{{ addressData.addressEns }}</p>
          <span class="address">{{ addressData.address }}</span>
        </div>
        <div v-else class="twocol">
          <span class="address">{{ addressData.address }}</span>
        </div>
        <div class="twocol right">
          <span class="balanceLabel">Liquid balance</span>
          <span v-if="hasData" class="balance"
            >{{ addressData.balance | toEtherFixed }}
          </span>
          <ContentLoader v-else :width="84" :height="20" />
          <small> EBK</small>
          <br />
          <span class="balanceLabel">Staked balance</span>
          <span v-if="hasData" class="balance"
            >{{ (addressData.stake / 10000).toFixed(4) }}
          </span>
          <ContentLoader v-else :width="84" :height="20" />
          <small> EBK</small>
        </div>
      </div>
      <div v-if="addressData.block_rewards == 0" class="chart_wrapper">
        <Chart v-if="chartDataLoaded" :chart-data="balanceData" :height="300" />
        <ContentLoader v-else :width="1000" :height="300" />
      </div>
    </div>
    <div v-if="addressData.stats" class="panel">
      <h2>Producer Info</h2>
      <table>
        <tr>
          <td>Block rewards</td>
          <td>
            {{ addressData.block_rewards | toEtherFixed }}
            <small>EBK</small>
          </td>
        </tr>
        <tr>
          <td>Votes</td>
          <td>{{ statsData.stake / 10000 }} <small>EBK</small></td>
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
                  :class="{ danger: stats.missedBlocks > 0 }"
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
        </tr> -->
      </table>
    </div>
    <div v-if="addressData.address" class="panel">
      <h2>Transactions</h2>
      <Transactions
        :key="`txs-for-address-${addressData.address}`"
        :address="addressData.address"
        :max-offset="addressData.tx_count"
        :class="{ active: txs.length > 0 }"
      />
      <p v-if="txs.length == 0" class="no-data">There are no transactions.</p>
    </div>
  </div>
</template>

<script>
import Web3 from 'web3'
import Chart from './Chart'
import { timeConverter } from '@/utils'

import ContentLoader from './ContentLoader'

export default {
  components: {
    ContentLoader,
    Chart,
  },
  props: {
    addressData: {
      type: Object,
      default: () => ({}),
    },
    txs: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      address: '',
      chartDataLoaded: false,
    }
  },
  computed: {
    hasData() {
      return !!this.addressData.address
    },
    balanceData: function() {
      const data = this.addressData
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
    statsData: function() {
      const [delegateInfo, ...rest] = this.addressData.stats.delegates.filter(
        delegate => {
          const lastPeriod = delegate[delegate.length - 1]
          return lastPeriod.address === this.addressData.address
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
  },
  watch: {
    addressData: function() {},
    txs: function() {
      this.chartDataLoaded = true
    },
  },
  created: function() {},
  methods: {
    timeConverter: timeConverter,
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
table {
  text-align: left;
}

tr:nth-child(odd) {
  background: #fff;
}
td:nth-child(2) {
  font-weight: inherit;
}
#block_wrapper {
  opacity: 0;
}
#block_wrapper.active {
  opacity: 1;
  display: block;
}
h3.address {
  font-size: 22px;
}
.ens .title {
  margin: 2px 0 11px 7px;
  font-size: 18px;
  font-weight: 600;
}

.ens .address {
  color: #acb4c9;
}

.twocol {
  display: inline-block;
  width: 49%;
}
.twocol > span.address {
  padding-left: 7px;
}
.twocol.right {
  text-align: right;
}
.valignCenter {
  display: flex;
  align-items: center;
  justify-content: center;
}
.balanceLabel {
  font-weight: 400;
  color: #acb4c9;
  margin-right: 10px;
}
.balance {
  font-size: 24px;
  font-weight: 600;
}
.chart_wrapper {
  position: relative;
  width: 100% !important;
  padding-top: 40px;
  overflow: hidden;
}

.panel h2:not(:first-child) {
  margin-top: 22px;
}

.missedBlocks {
  margin: -4px -6px;
}
.missedBlocks th:first-child {
  min-width: 150px;
}
.missedBlocks th:not(:first-child),
.missedBlocks td:not(:first-child) {
  text-align: right;
}
.danger {
  color: #f44336;
}
.no-data {
  text-align: center;
}
@media (max-width: 800px) {
  .valignCenter {
    display: block;
  }
  .missedBlocks th:first-child {
    min-width: auto;
  }
  .twocol {
    display: block;
    width: 100%;
    overflow-x: auto;
    padding: 0px;
    margin: 0px;
    padding: 8px 0px;
  }
  .ens .title {
    margin-left: 0;
  }
  div.twocol span.address {
    font-size: 14px;
    padding-left: 0px;
  }
  .twocol.right {
    text-align: left;
  }
  .chart_wrapper {
    padding-top: 10px;
  }
}
</style>
