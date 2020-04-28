<template>
  <div>
    <div id="search-wrapper" :class="{ withTabbar: isActive }">
      <input
        ref="searchField"
        v-model="searchInput"
        type="text"
        placeholder="Search by txid, block number, address or ENS name"
        @keyup.enter="searchWithQuery('searchBtn')"
      />
      <button
        id="searchBtn"
        ref="submitSearch"
        @click="searchWithQuery('searchBtn')"
      >
        <span>Go</span>
      </button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import { store, mutations } from '@/store'

import Address from '@/components/Address'
import Block from '@/components/Block'
import Transaction from '@/components/Transaction'
import { getAddressForEns, storeEnsNameForAddress } from '@/utils/ens'

export default {
  props: {
    tabbarActive: {
      type: Boolean,
      default: false,
    },
    searchQuery: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      error: '',
      searchInput: '',
      isActive: false,
      isBlockActive: false,
      isTransactionActive: false,
      isAddressActive: false,
      block: {},
      transaction: {},
      address: {},
      txs: [],
    }
  },
  computed: {
    blockHeight: () => store.blockHeight,
  },
  watch: {
    searchQuery: function(val, oldVal) {
      if (val !== oldVal) {
        if (val === '') {
          this.isActive = false
          this.isBlockActive = false
          this.isTransactionActive = false
          this.isAddressActive = false
          this.searchInput = ''
          this.block = {}
          this.transaction = {}
          this.address = {}
          this.txs = []
        } else {
          this.checkQuery()
        }
      }
    },
    searchInput: function() {
      this.error = ''
      //this.$refs.submitSearch.focus();
    },
    tabbarActive: function() {
      if (this.tabbarActive && !this.isActive) {
        this.isActive = true
      } else if (
        !this.tabbarActive &&
        !this.isBlockActive &&
        !this.isTransactionActive &&
        !this.isAddressActive
      ) {
        this.isActive = false
      }
    },
  },
  created: function() {
    this.checkQuery()
  },
  methods: {
    checkQuery: function() {
      if (typeof this.searchQuery !== 'undefined' && this.searchQuery) {
        this.searchInput = this.searchQuery
        this.searchWithQuery(null)
      }
    },
    searchWithQuery: async function(e) {
      this.error = ''
      var queryStr = this.searchInput.replace(/ /g, '')
      try {
        if (
          isNaN(queryStr) ||
          queryStr.substring(0, 2) == '0x' ||
          queryStr == ''
        ) {
          if (queryStr.substring(0, 2) == '0x') {
            switch (queryStr.length) {
              case 42:
                console.log('Search address', queryStr)
                this.isActive = true
                this.isBlockActive = false
                this.isTransactionActive = false
                this.isAddressActive = true
                this.getAddress(queryStr)
                break
              case 66:
                console.log('Search TXid', queryStr)
                this.isActive = true
                this.isBlockActive = false
                this.isTransactionActive = true
                this.isAddressActive = false
                this.getTransaction(queryStr)
                break
            }
          } else {
            if (queryStr != '') {
              try {
                console.log('Search ENS name', queryStr)
                const ensAddress = await getAddressForEns(queryStr)
                if (ensAddress) {
                  this.isBlockActive = false
                  this.isTransactionActive = false
                  this.isAddressActive = true
                  this.isActive = true
                  this.getAddress(ensAddress)

                  await storeEnsNameForAddress(queryStr, ensAddress)
                } else {
                  throw new Error('No address found at ENS contract')
                }
              } catch (err) {
                throw new Error('Failed to match an ENS name:', err)
              }
            } else {
              throw new Error('Nothing to search')
            }
          }
        } else {
          // if is number, check for block
          console.log('Search block', queryStr)
          this.isBlockActive = true
          this.isTransactionActive = false
          this.isAddressActive = false
          this.isActive = true

          this.getBlock(queryStr)
        }
      } catch (err) {
        this.error =
          'Please enter a txid, a block number, an account address or an ENS name.'
        this.isActive = false
        this.isBlockActive = false
        this.isTransactionActive = false
        this.isAddressActive = false
        if (e == 'searchBtn') {
          mutations.setQuery('')
        }
      }

      mutations.setContentActive(false)

      if (queryStr != '') {
        this.$router.push(
          {
            path: '/search/' + queryStr,
          },
          () => {}
        )
      } else if (queryStr == '' && e == 'searchBtn') {
        this.$router.push(
          {
            path: '/',
          },
          () => {}
        )
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
          this.isActive = false
          this.isBlockActive = false
        }
      )
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
                  this.isActive = false
                  this.isTransactionActive = false
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
    getAddress: function(address) {
      this.txs = []

      this.$http.get(process.env.API_ENDPOINT + '/address/' + address).then(
        function(response) {
          this.address = response.data

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
          this.isActive = false
          this.isAddressActive = false
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
    getABI: function(contractAddress) {
      this.abi = null
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

#search-wrapper {
  position: relative;
  display: block;
  margin-top: $spacer-3;
}

input[type='text'] {
  width: calc(100% - 50px - #{$spacer-2});
  height: 52px;

  padding-left: 50px;

  color: #112f42;

  background: url('../assets/img/ic_search.png') no-repeat #ffffff;
  background-size: 20px;
  background-position: 15px 18px;

  border: solid 1px rgba(17, 47, 66, 0.15);
  border-radius: 4px;

  font-size: 18px;
  text-align: center;

  transition: 0.5s all ease;
  opacity: 1;

  &:hover {
    opacity: 1;
  }

  &::-moz-placeholder,
  &::-webkit-input-placeholder {
    color: #a7b2b9;
  }

  @media (max-width: 960px) {
    text-align: left;
    text-overflow: ellipsis;
    font-size: 16px;
    background-size: 15px;
    background-position: 15px 20px;
  }
}

input:focus,
button:focus {
  outline: none;
  opacity: 1;
  transform: scale(1);
}

input:focus + button {
  opacity: 1;
  transform: scale(1);
}

button {
  position: absolute;
  top: 5px;
  right: 8px;
  width: 54px;
  height: 46px;

  background: #fe4184;
  color: white;

  border: 0;
  border-radius: 4px;

  font-size: 20px;
  font-weight: 600;

  opacity: 0;

  transition: 0.5s all ease;
  transform: scale(0.9);

  &:active {
    transform: scale(0.9);
  }

  @media (max-width: $mobile-grid-breakpoint) {
    top: 0;
    right: 0;

    height: 56px;

    font-size: 16px;
    font-weight: 600;

    border-radius: 0 4px 4px 0;
  }
}

.error {
  margin-bottom: 0;
  text-align: left;
  color: #fe4184;
  transition: 0.5s opacity ease;

  &.hide {
    opacity: 0;
  }
}
</style>
