<template>
  <div id="block_wrapper">
    <h1>
      <img src="../assets/ic_transactions.png" class="title_img" alt />
      <span v-if="isContractCreation">Contract Creation</span>
      <span v-else>Transaction</span>
    </h1>
    <div class="panel">
      <div class="widget_wrapper">
        <div class="tablewrapper">
          <table>
            <tr>
              <td class="absolute">
                <h3>FROM</h3>
              </td>
              <td class>
                <router-link
                  class="address lon"
                  :to="{
                    name: RouteNames.SEARCH,
                    params: { query: transactionData.from },
                  }"
                  >{{ transactionData.from }}</router-link
                >
              </td>
            </tr>
            <tr>
              <td class></td>
              <td>
                <img
                  class="ic_to absolute"
                  src="../assets/ic_from_to.png"
                  alt
                />
              </td>
            </tr>
            <tr v-if="!isContractCreation">
              <td class="absolute">
                <h3>TO</h3>
              </td>
              <td class>
                <router-link
                  class="address lon"
                  :to="{
                    name: RouteNames.SEARCH,
                    params: { query: transactionData.to },
                  }"
                  >{{ transactionData.to }}</router-link
                >
              </td>
            </tr>
            <tr v-if="isContractCreation">
              <td class="absolute">
                <h3>CONTRACT ADDRESS</h3>
              </td>
              <td class>
                <router-link
                  class="address lon"
                  :to="{
                    name: RouteNames.SEARCH,
                    params: { query: transactionData.contractAddress },
                  }"
                  >{{ transactionData.contractAddress }}</router-link
                >
              </td>
            </tr>
          </table>
        </div>
        <ul
          class="status"
          :class="{
            success: transactionData.status,
            failed: transactionData.status === 0,
          }"
        >
          <li>
            <h3>AMOUNT</h3>
          </li>
          <li>
            <h1>{{ weiToEbk(transactionData.value) }}</h1>
          </li>
          <li>
            <span>ebakus</span>
          </li>
          <li>
            <img
              v-if="transactionData.status"
              class="ic_check"
              src="../assets/ic_check.png"
              alt
            />
            <img v-else class="ic_check" src alt />
          </li>
        </ul>
      </div>
    </div>

    <div class="panel">
      <h2>Details</h2>
      <div class="tablewrapper">
        <table>
          <tr>
            <td class="headcol">TxHash</td>
            <td class="long">
              <router-link
                class="transaction"
                :to="{
                  name: RouteNames.SEARCH,
                  params: { query: transactionData.hash },
                }"
                >{{ transactionData.hash }}</router-link
              >
            </td>
          </tr>
          <tr>
            <td class="headcol">Timestamp</td>
            <td class="long">{{ timeConverter(transactionData.timestamp) }}</td>
          </tr>
          <tr>
            <td class="headcol">Block hash</td>
            <td class="long">
              <router-link
                class="account"
                :to="{
                  name: RouteNames.SEARCH,
                  params: { query: transactionData.blockHash },
                }"
                >{{ transactionData.blockHash }}</router-link
              >
            </td>
          </tr>
          <tr>
            <td class="headcol">Block number</td>
            <td class="long">
              <strong>
                <router-link
                  class="block"
                  :to="{
                    name: RouteNames.SEARCH,
                    params: { query: transactionData.blockNumber },
                  }"
                  >{{ transactionData.blockNumber }}</router-link
                >
              </strong>
            </td>
          </tr>
          <tr>
            <td class="headcol">Produced by</td>
            <td class="long">
              <router-link
                class="account"
                :to="{
                  name: RouteNames.SEARCH,
                  params: { query: transactionData.producer },
                }"
                >{{ transactionData.producer }}</router-link
              >
            </td>
          </tr>
          <tr>
            <td class="headcol">Gas limit</td>
            <td class="long">{{ transactionData.gasLimit }}</td>
          </tr>
          <tr>
            <td class="headcol">Gas used</td>
            <td class="long">{{ transactionData.gasUsed }}</td>
          </tr>
          <tr>
            <td class="headcol">Cumulative gas used</td>
            <td class="long">{{ transactionData.cumulativeGasUsed }}</td>
          </tr>
          <tr>
            <td class="headcol">Nonce</td>
            <td class="long">{{ transactionData.nonce }}</td>
          </tr>
          <tr>
            <td class="headcol">Work nonce</td>
            <td class="long">{{ transactionData.workNonce }}</td>
          </tr>
          <tr>
            <td class="headcol">Transaction index</td>
            <td class="long">{{ transactionData.transactionIndex }}</td>
          </tr>
          <tr>
            <td class="headcol">Status</td>
            <td class="long">{{ transactionData.status }}</td>
          </tr>
          <tr v-if="confirmationsCount > 0">
            <td class="headcol">Confirmations count</td>
            <td class="long">{{ confirmationsCount }}</td>
          </tr>
          <tr v-if="transactionData.abi">
            <td class="headcol">Input</td>
            <td class="long">
              <strong>{{ decodedInput.name }}(</strong>
              {{ decodedInput.args }}
              <strong>)</strong>
              <a
                id="downloadAbi"
                :href="downloadAbiContent.data"
                :download="downloadAbiContent.filename"
                >Get ABI</a
              >
            </td>
          </tr>
          <tr
            v-for="(param, idx) in decodedInput.params"
            :key="idx"
            class="input-data"
          >
            <td class="headcol">
              - <strong>{{ param.type }}</strong> {{ param.name }}
            </td>
            <td class="long">
              {{ param.value }}
            </td>
          </tr>
          <tr v-if="!transactionData.abi">
            <td class="headcol">Input</td>
            <td class="long">{{ transactionData.input }}</td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { RouteNames } from '@/router'
import { store } from '@/store'
import { timeConverter, weiToEbk, isZeroHash } from '@/utils'
import { decodeDataUsingAbi } from '@/utils/abi'

export default {
  props: {
    transactionData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      confirmationsCount: 0,
    }
  },
  computed: {
    RouteNames: () => RouteNames,
    globalBlockHeight: () => store.blockHeight,
    isContractCreation: function() {
      return !isZeroHash(this.transactionData.contractAddress)
    },
    decodedInput: function() {
      const data = decodeDataUsingAbi(
        this.transactionData.abi,
        this.transactionData.input
      )

      if (typeof data === 'object' && data.name) {
        let args = []

        for (let { name: parName, type } of data.params) {
          args.push(`${type} ${parName}`)
        }

        data.args = args.join(', \u{00AD}')
      }
      return data
    },
    downloadAbiContent: function() {
      return {
        data:
          'data:text/json;charset=utf-8,' +
          encodeURIComponent(JSON.stringify(this.transactionData.abi, 0, 2)),
        filename: `${this.transactionData.to}-abi.json`,
      }
    },
  },
  watch: {
    transactionData: function() {
      if (this.globalBlockHeight > this.transactionData.blockNumber) {
        this.$set(
          this,
          'confirmationsCount',
          this.globalBlockHeight - this.transactionData.blockNumber
        )
      }
    },
  },
  created: function() {},
  methods: {
    timeConverter: timeConverter,
    weiToEbk: weiToEbk,
    decodeDataUsingAbi: decodeDataUsingAbi,
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

#block_wrapper {
  opacity: 0;
}
#block_wrapper.active {
  opacity: 1;
  display: block;
}
.block {
  color: #000000;
}
th,
td {
  padding: 4px 6p x;
  text-overflow: ellipsis;
  overflow: hidden;
}
td {
  color: #5b5b5b;
}
td:last-child {
  font-weight: 500;
}
strong {
  color: #000;
}

span.txstatus_badge {
  font-size: 16px;
  font-weight: 500;
  background: #fff;
  border-radius: 6px;
  padding: 4px 30px 4px 12px;
  box-shadow: 0 2px 33px 0 rgba(17, 47, 66, 0.1);
  vertical-align: 4px;
  margin-left: 4px;
}
span.txstatus_badge.success {
  background: url('../assets/ic_check.png') no-repeat #fff;
  background-size: 16px;
  background-position: right 6px center;
}
span.txstatus_badge.pending {
  color: #6f6f6f;
}

.panel {
  position: relative;
}

.widget_wrapper h3 {
  font-size: 12px;
}
.widget_wrapper img.ic_to {
  width: 18px;
  transform: rotate(90deg);
}
.widget_wrapper tr {
  position: relative;
  line-height: 42px;
  padding: 2px 10px;
}
.widget_wrapper table {
  margin-bottom: 55px;
}
.widget_wrapper ul {
  position: absolute;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  align-content: space-between;
  height: 50px;
  bottom: 0px;
  left: 0px;
  padding: 0px;
  padding-top: 14px;
  padding-bottom: 10px;
  align-items: center;
  background: #fafafa;
  width: 100%;
  margin: 0px;
  border-radius: 0px 0px 4px 4px;
  transition: all 0.5s ease-out;
}
.widget_wrapper li:first-child {
  margin-left: 40px;
}
.widget_wrapper li {
  margin-right: 10px;
}
.widget_wrapper li:last-child {
  margin-left: auto;
  margin-right: 30px;
}

.widget_wrapper img.ic_check {
  width: 34px;
}
li h3 {
  margin-top: 20px;
}
li span {
  display: block;
  margin-top: 5px;
}
ul.status.success {
  background: #e6faf4;
}
ul.status.failed {
  background: #f7dbdb;
}

.absolute {
  position: absolute;
  background: #fff;
  top: auto;
  width: 66px;
}
td.absolute + td {
  padding-left: 66px;
}
img.ic_to.absolute {
  display: none;
}
.lon {
  display: inline-block;
  word-break: break-all;
}
.input-data td {
  font-size: 0.85em;
}
.input-data td:last-child {
  background-color: #f3f3f3;
}
#downloadAbi {
  float: right;
  padding: 1px 8px;
  border-radius: 4px;
  border: 1px solid #acb4c9;
  color: #34393d;
  background: #f8f9fb;
  font-size: 0.8em;
}
#downloadAbi:hover {
  box-shadow: 0 2px 43px 0 rgba(0, 0, 0, 0.1);
}
@media (max-width: 560px) {
  .absolute {
    position: absolute;
    background: #fff;
    top: auto;
    left: 15px;
  }
  img.ic_to.absolute {
    display: none;
  }
  .widget_wrapper li:first-child {
    margin-left: 20px;
  }
  .widget_wrapper a {
    font-size: 13.5px;
    line-height: 20px;
  }
  .widget_wrapper table {
    margin-bottom: 70px;
  }
  .input-data td:first-child {
    background-color: transparent;
    white-space: inherit;
  }
}
</style>
