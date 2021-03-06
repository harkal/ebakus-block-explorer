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
      :class="{ collapsed: !address.isContract || !abi || abi.length === 0 }"
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
        <a
          class="button"
          :href="`${remixUrl}/#loadFromAbi=${address.address}`"
          target="_blank"
        >
          <img src="@/assets/img/ic-remix.svg" alt />
          Interact with contract
        </a>
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
            >{{ (address.stake / 10000) | numberFormatterFixed }}</span
          >
          <ContentLoader v-else :width="84" :height="20" />
          <small> EBK</small>
        </div>
      </div>
      <div
        v-if="!chartDataLoaded || address.block_rewards == 0"
        class="chartWrapper"
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
        <tr>
          <td colspan="2" class="missedBlocks">
            <table>
              <tr>
                <th>&nbsp;</th>
                <th v-for="(label, idx) in statsData.labels" :key="idx">
                  {{ label }}
                </th>
              </tr>
              <tr>
                <td class="headcol">Missed blocks</td>
                <td
                  v-for="(stats, idx) in statsData.data"
                  :key="idx"
                  :class="{ 'txt-danger': stats.missedBlocks > 0 }"
                >
                  {{ stats.missedBlocks }}
                </td>
              </tr>
              <tr>
                <td class="headcol">Density</td>
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
        :key="`txs-for-address-${address.address}`"
        :address="address.address"
        :is-contract-address="address.isContract"
        :abi="abi"
        :max-offset="address.tx_count"
        :update-txs="setTxs"
        :class="{ active: txs.length > 0 }"
      />
    </div>
  </div>
</template>

<script>
import Web3 from 'web3'
import floor from 'lodash/floor'

import { store } from '@/store'
import { timeConverter } from '@/utils'
import { getAbi, getValueForParam } from '@/utils/abi'

import Chart from './Chart'
import ContentLoader from './ContentLoader'
import {
  decodeSystemContractData,
  getSystemContractAbi,
} from '../utils/systemContract'

export default {
  components: {
    ContentLoader,
    Chart,
  },
  filters: {
    toEtherFixedForChart: function(wei) {
      if (typeof wei == 'number') {
        wei = '0x' + wei.toString(16)
      }
      const ebk = Web3.utils.fromWei(wei)

      return floor(parseFloat(ebk), 4).toFixed(4)
    },
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
    remixUrl: () => process.env.REMIX_URL,
    balanceData: function() {
      const data = this.address
      if (!data || !data.address) return

      const BN = Web3.utils.BN

      const txs = this.txs.slice().reverse()
      const _labels = []
      let accBalance = new BN('0')
      let balanceData = {}
      let _liquidBalances = []
      let _stakedBalances = []
      let _datasets = []
      let i
      let accStaked = 0

      for (i = 0; i < txs.length; i++) {
        _labels.push(this.timeConverter(txs[i].timestamp))

        if (
          [data.address, 'this'].includes(txs[i].from) &&
          txs[i].to != 'this'
        ) {
          accBalance = accBalance.add(new BN(String(txs[i].value)))
        } else if (
          txs[i].from != 'this' &&
          [data.address, 'this'].includes(txs[i].to)
        ) {
          accBalance = accBalance.sub(new BN(String(txs[i].value)))
        }

        if (
          txs[i].to == '0x0000000000000000000000000000000000000101' &&
          txs[i].input
        ) {
          const { name, params } = decodeSystemContractData(txs[i].input)

          if (name === 'stake') {
            const amount = getValueForParam('amount', params)
            accStaked += amount / 10000
          } else if (name === 'unstake') {
            const amount = getValueForParam('amount', params)
            accStaked -= amount / 10000
          }
        }

        _liquidBalances.push(accBalance)
        _stakedBalances.push(accStaked)
      }

      _labels.unshift('')

      let _totalBalances = [..._liquidBalances]

      const liquidBalance = new BN(String(data.balance))
      let stakedBalance = data.stake / 10000

      let cLiquidBalances = liquidBalance

      if (txs.length > 0) {
        cLiquidBalances = cLiquidBalances.sub(_liquidBalances[txs.length - 1])
        stakedBalance -= _stakedBalances[txs.length - 1]
      }

      for (i = 0; i < txs.length; i++) {
        _liquidBalances[i] = _liquidBalances[i].add(cLiquidBalances)
        _stakedBalances[i] += stakedBalance
      }
      _liquidBalances.unshift(cLiquidBalances)
      _stakedBalances.unshift(stakedBalance)

      // TODO: remove this. cap lower value to 0
      _liquidBalances = _liquidBalances.map(value =>
        value.lt(new BN('0')) ? new BN('0') : value
      )

      // now that we finished with number calcs, keep 4 decimals (converts to string)
      _liquidBalances = _liquidBalances.map(value =>
        this.$options.filters.toEtherFixedForChart(value)
      )

      _datasets = [
        {
          label: 'Staked balance',
          borderColor: '#eb7f95',
          backgroundColor: '#ffc5d0',
          data: _stakedBalances,
        },
        {
          label: 'Liquid balance',
          borderColor: '#a3d6ee',
          backgroundColor: '#cfefff',
          data: _liquidBalances,
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
        ? this.$options.filters.toUSDString(this.address.stake / 10000)
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
  created: async function() {
    await getSystemContractAbi() // preload system contract ABI

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
    },
    setTxs: function(txs) {
      this.$set(this, 'txs', txs)
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

.chartWrapper {
  position: relative;
  width: 100% !important;
  padding-top: 40px;
  overflow: hidden;

  @media (max-width: $mobile-grid-breakpoint) {
    padding-top: 10px;
  }
}

.missedBlocks {
  margin: 0;
  padding: 0;

  table {
    width: 100%;
  }

  th:first-child {
    min-width: 106px;

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
