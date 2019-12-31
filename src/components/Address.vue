<template>
  <div id="block_wrapper">
    <h1>Address</h1>

    <div class="panel">
      <div class="twocol">
        <span class="address">{{ addressData.address }}</span>
      </div>
      <div class="twocol right">
        <span class="balanceLabel">Balance</span>
        <span class="balance">{{
          weiToEbk(addressData.balance).toFixed(4)
        }}</span>
        <small>ebakus</small>
      </div>
      <div v-if="addressData.block_rewards == 0" class="chart_wrapper">
        <Chart
          v-if="chartDataLoaded"
          :chart-data="balanceData"
          :height="300"
        ></Chart>
      </div>
    </div>
    <div v-if="addressData.stats" class="panel">
      <h2>Producer Info</h2>
      <table>
        <tr>
          <td>Block rewards</td>
          <td>{{ weiToEbk(addressData.block_rewards).toFixed(4) }}</td>
        </tr>
        <tr>
          <td>Stake</td>
          <td>{{ statsData.stake }}</td>
        </tr>
        <tr>
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
        </tr>
      </table>
    </div>
    <div class="panel">
      <h2>Transactions</h2>
      <Transactions
        :txs="txs"
        :address="addressData.address"
        :max-offset="addressData.tx_count"
        :class="{ active: txs.length > 0 }"
      />
      <p v-if="txs.length == 0" class="no-data">There are no transactions.</p>
    </div>
  </div>
</template>

<script>
import Chart from './Chart'
import { timeConverter, weiToEbk } from '@/utils'

export default {
  components: {
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
    balanceData: function() {
      var i
      var balance = 0
      var balanceData = {}
      var _data = []
      var _datasets = []
      var _labels = []
      var txs = this.txs.slice().reverse()

      for (i = 0; i < txs.length; i++) {
        _labels.push(this.timeConverter(txs[i].timestamp))
        if (txs[i].from == 'this' && txs[i].to != 'this') {
          balance -= this.weiToEbk(txs[i].value)
        } else if (txs[i].from != 'this' && txs[i].to == 'this') {
          balance += this.weiToEbk(txs[i].value)
        }

        _data.push(balance)
      }

      _labels.unshift('')
      balance = this.weiToEbk(this.addressData.balance) - _data[txs.length - 1]
      for (i = 0; i < txs.length; i++) {
        _data[i] += balance
      }
      _data.unshift(balance)

      // now that we finished with number calcs, keep 4 decimals (converts to string)
      _data = _data.map(data => data.toFixed(4))

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
    weiToEbk: weiToEbk,
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
@media (max-width: 560px) {
  .twocol {
    display: block;
    width: 100%;
    overflow-x: auto;
    padding: 0px;
    margin: 0px;
    padding: 8px 0px;
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
  .missedBlocks th:first-child {
    min-width: auto;
  }
}
</style>
