<template>
  <div class="page-wrapper">
    <h1>
      <img src="@/assets/img/ic-transaction.svg" alt />
      <span v-if="isContractCreation">Contract Creation</span>
      <span v-else>Transaction</span>
    </h1>
    <div class="panel info-wrapper">
      <div class="table-wrapper">
        <table>
          <tr>
            <td>
              <h3>FROM</h3>
            </td>
            <td class>
              <router-link
                v-if="hasData"
                class="address lon"
                :to="{
                  name: RouteNames.ADDRESS,
                  params: { query: transaction.from },
                }"
                >{{ transaction.from }}</router-link
              >
              <ContentLoader v-else :width="400" />
            </td>
          </tr>
          <tr v-if="!isContractCreation">
            <td>
              <h3>TO</h3>
            </td>
            <td class>
              <router-link
                v-if="hasData"
                class="address lon"
                :to="{
                  name: RouteNames.ADDRESS,
                  params: { query: transaction.to },
                }"
                >{{ transaction.to }}</router-link
              >
              <ContentLoader v-else :width="400" />
            </td>
          </tr>
          <tr v-if="isContractCreation">
            <td>
              <h3>CONTRACT ADDRESS</h3>
            </td>
            <td>
              <router-link
                v-if="hasData"
                class="address lon"
                :to="{
                  name: RouteNames.ADDRESS,
                  params: { query: transaction.contractAddress },
                }"
                >{{ transaction.contractAddress }}</router-link
              >
              <ContentLoader v-else :width="300" />
            </td>
          </tr>
          <tr
            class="status"
            :class="{
              success: hasData && transaction.status,
              failed: hasData && transaction.status === 0,
            }"
          >
            <td>
              <h3>AMOUNT</h3>
            </td>
            <td>
              <h1 v-if="hasData">
                {{ transaction.value | toEtherFixed }} <small>EBK</small>
              </h1>
              <ContentLoader v-else :width="25" :height="22" />
            </td>
            <td>
              <img
                v-if="hasData && transaction.status"
                class="ic_check"
                src="@/assets/img/ic_check.png"
                alt="Successfull transaction"
              />
              <img
                v-else-if="hasData && !transaction.status"
                class="ic_check"
                src="@/assets/img/ic_error.svg"
                alt="Failed transaction"
              />
            </td>
          </tr>
        </table>
      </div>
    </div>

    <div class="panel">
      <h2>Details</h2>
      <div class="table-wrapper">
        <table>
          <tr>
            <td class="headcol">TxHash</td>
            <td class="long">
              <span v-if="hasData">{{ transaction.hash }}</span>
              <ContentLoader v-else :width="600" />
            </td>
          </tr>
          <tr>
            <td class="headcol">Timestamp</td>
            <td class="long">
              <span v-if="hasData">
                {{ timeConverter(transaction.timestamp) }}
              </span>
              <ContentLoader v-else :width="150" />
            </td>
          </tr>
          <tr>
            <td class="headcol">Block hash</td>
            <td class="long">
              <span v-if="hasData">{{ transaction.blockHash }}</span>
              <ContentLoader v-else :width="600" />
            </td>
          </tr>
          <tr>
            <td class="headcol">Block number</td>
            <td class="long">
              <strong v-if="hasData">
                <router-link
                  class="block"
                  :to="{
                    name: RouteNames.BLOCK,
                    params: { query: transaction.blockNumber },
                  }"
                >
                  {{ transaction.blockNumber }}
                </router-link>
              </strong>
              <ContentLoader v-else />
            </td>
          </tr>
          <tr>
            <td class="headcol">Produced by</td>
            <td class="long">
              <router-link
                v-if="hasData"
                class="address"
                :to="{
                  name: RouteNames.ADDRESS,
                  params: { query: transaction.producer },
                }"
                >{{ transaction.producer }}</router-link
              >
              <ContentLoader v-else :width="350" />
            </td>
          </tr>
          <tr>
            <td class="headcol">Gas limit</td>
            <td class="long">
              <span v-if="hasData">
                {{ transaction.gasLimit }}
              </span>
              <ContentLoader v-else />
            </td>
          </tr>
          <tr>
            <td class="headcol">Gas used</td>
            <td class="long">
              <span v-if="hasData">
                {{ transaction.gasUsed }}
              </span>
              <ContentLoader v-else />
            </td>
          </tr>
          <tr>
            <td class="headcol">Cumulative gas used</td>
            <td class="long">
              <span v-if="hasData">
                {{ transaction.cumulativeGasUsed }}
              </span>
              <ContentLoader v-else />
            </td>
          </tr>
          <tr>
            <td class="headcol">Nonce</td>
            <td class="long">
              <span v-if="hasData">
                {{ transaction.nonce }}
              </span>
              <ContentLoader v-else />
            </td>
          </tr>
          <tr>
            <td class="headcol">Work nonce</td>
            <td class="long">
              <span v-if="hasData">
                {{ transaction.workNonce }}
              </span>
              <ContentLoader v-else />
            </td>
          </tr>
          <tr>
            <td class="headcol">Transaction index</td>
            <td class="long">
              <span v-if="hasData">
                {{ transaction.transactionIndex }}
              </span>
              <ContentLoader v-else />
            </td>
          </tr>
          <tr>
            <td class="headcol">Status</td>
            <td class="long">
              <span v-if="hasData">{{ transaction.status }} </span>
              <ContentLoader v-else />
            </td>
          </tr>
          <tr v-if="confirmationsCount > 0">
            <td class="headcol">Confirmations count</td>
            <td class="long">
              <span v-if="hasData">{{ confirmationsCount }} </span>
              <ContentLoader v-else />
            </td>
          </tr>
          <tr v-if="transaction.abi">
            <td class="headcol">Input</td>
            <td class="long">
              <strong>{{ decodedInput.name }}(</strong>
              {{ decodedInput.args }}
              <strong>)</strong>
              <a
                class="downloadAbi"
                :href="downloadAbiContent.data"
                :download="downloadAbiContent.filename"
              >
                Get ABI
              </a>
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
          <tr v-if="!transaction.abi">
            <td class="headcol">Input</td>
            <td class="long">
              <span v-if="hasData">
                {{ transaction.input }}
              </span>
              <ContentLoader v-else :width="600" :height="48" />
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { RouteNames } from '@/router'
import { store, mutations } from '@/store'
import { timeConverter, isZeroHash } from '@/utils'
import { decodeDataUsingAbi } from '@/utils/abi'

import ContentLoader from './ContentLoader'

export default {
  components: {
    ContentLoader,
  },
  data() {
    return {
      transaction: {},
      confirmationsCount: 0,
    }
  },
  computed: {
    RouteNames: () => RouteNames,

    searchQuery: () => store.searchQuery,

    hasData() {
      return !!this.transaction.from
    },
    globalBlockHeight: () => store.blockHeight,
    isContractCreation: function() {
      return this.hasData && !isZeroHash(this.transaction.contractAddress)
    },
    decodedInput: function() {
      const data = decodeDataUsingAbi(
        this.transaction.abi,
        this.transaction.input
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
          encodeURIComponent(JSON.stringify(this.transaction.abi, 0, 2)),
        filename: `${this.transaction.to}-abi.json`,
      }
    },
  },
  watch: {
    searchQuery: function(val, oldVal) {
      if (val !== oldVal) {
        this.search()
      }
    },
    transaction: function() {
      if (this.globalBlockHeight > this.transaction.blockNumber) {
        this.$set(
          this,
          'confirmationsCount',
          this.globalBlockHeight - this.transaction.blockNumber
        )
      }
    },
  },
  created: function() {
    this.search()
  },
  methods: {
    timeConverter: timeConverter,
    decodeDataUsingAbi: decodeDataUsingAbi,

    search: function() {
      if (typeof this.searchQuery !== 'undefined' && this.searchQuery) {
        const txHash = this.searchQuery.replace(/ /g, '')
        this.getTransaction(txHash)
      }
    },
    getTransaction: function(txHash) {
      return new Promise((resolve, reject) => {
        this.$http.get(process.env.API_ENDPOINT + '/block/-1?range=1').then(
          function(response) {
            mutations.setBlockHeight(response.data[0].number)
            this.$http
              .get(process.env.API_ENDPOINT + '/transaction/' + txHash)
              .then(
                function(response) {
                  this.transaction = response.data

                  if (!['', '0x', null].includes(this.transaction.input)) {
                    this.getABI(this.transaction.to)
                  }

                  // extra API call to retrieve block producer, later this will be returned by the API tx call itself
                  this.$http
                    .get(
                      process.env.API_ENDPOINT +
                        '/block/' +
                        this.transaction.blockNumber
                    )
                    .then(
                      function(response) {
                        this.$set(
                          this.transaction,
                          'producer',
                          response.data.producer
                        )
                        resolve(response)
                      },
                      function(err) {
                        console.error(
                          `Failed to fetch block "${this.transaction.blockNumber}": `,
                          err
                        )
                        reject(err)
                      }
                    )
                },
                function(err) {
                  console.error(
                    `Failed to fetch transaction "${txHash}": `,
                    err
                  )
                  this.error = 'Failed to get transaction.'
                  reject(err)
                }
              )
          },
          function(err) {
            console.error('Failed to fetch latest block:', err)
            reject(err)
          }
        )
      })
    },
    getABI: function(contractAddress) {
      this.$http.get(process.env.API_ENDPOINT + '/abi/' + contractAddress).then(
        function(response) {
          this.$set(this.transaction, 'abi', response.data)
        },
        function(err) {
          console.error(`Failed to fetch ABI for "${contractAddress}": `, err)
        }
      )
    },
  },
}
</script>

<style scoped lang="scss">
@import '../assets/css/variables';

.info-wrapper {
  position: relative;
  padding: 0;

  h1,
  h3 {
    margin-bottom: auto;
    margin-top: auto;
  }

  h3 {
    font-size: 12px;
  }

  table {
    width: 100%;
  }

  tr:nth-child(1) td {
    padding-top: 40px;
  }

  tr:nth-child(2) td {
    padding-bottom: 40px;
  }

  td {
    padding: $spacer-3 0;

    &:first-child {
      width: 60px;
      padding-left: $spacer-4;
      padding-right: $spacer-4;
    }
  }

  .status {
    border-radius: 0px 0px 4px 4px;

    &.success {
      background: #e6faf4;
    }
    &.failed {
      background: #f7dbdb;
    }
  }

  img.ic_check {
    width: 34px;
  }
}

.lon {
  display: inline-block;
  word-break: break-all;
}

.input-data {
  td {
    font-size: 0.85em;

    &:last-child {
      background-color: #f3f3f3;
    }

    @media (max-width: $mobile-grid-breakpoint) {
      &:first-child {
        background-color: transparent;
        white-space: inherit;
      }
    }
  }
}

.downloadAbi {
  float: right;
  padding: 1px 8px;
  border-radius: 4px;
  border: 1px solid #acb4c9;
  color: #34393d;
  background: #f8f9fb;
  font-size: 0.8em;

  &:hover {
    box-shadow: 0 2px 43px 0 rgba(0, 0, 0, 0.1);
  }
}
</style>
