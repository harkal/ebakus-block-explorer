<template>
  <div id="topbar" :class="{ withTabbar: isActive }">
    <img
      src="../assets/blockExplorer_logo_2.png"
      alt
      :class="{ withTabbar: isActive }"
      @click="$router.push('/')"
    />
    <img
      id="logo"
      alt="New block produced"
      src="../assets/blockExplorer_logo.png"
      :class="{ withTabbar: isActive }"
    />
    <div id="search_wrapper" :class="{ withTabbar: isActive }">
      <input
        ref="searchField"
        v-model="searchInput"
        type="text"
        placeholder="Search by txid, block number or address"
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
    <p class="error">{{ error }}</p>

    <Block :class="{ active: isBlockActive }" :block-data="block" :txs="txs" />
    <Address
      :class="{ active: isAddressActive }"
      :address-data="address"
      :txs="txs"
    />
    <Transaction
      :class="{ active: isTransactionActive }"
      :transaction-data="transaction"
    />
  </div>
</template>

<script>
import { store, mutations } from '@/store'

import Address from '@/components/Address'
import Block from '@/components/Block'
import Transaction from '@/components/Transaction'

export default {
  components: {
    Address,
    Block,
    Transaction,
  },
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
    searchWithQuery: function(e) {
      var queryStr = this.searchInput.replace(/ /g, '')
      if (
        isNaN(queryStr) ||
        queryStr.substring(0, 2) == '0x' ||
        queryStr == ''
      ) {
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
            this.getTransaction(queryStr).then(
              function() {},
              err => {
                console.error(
                  `Failed to fetch transaction for "${queryStr}": `,
                  err
                )
                this.isBlockActive = true
                this.isTransactionActive = false
                this.getBlock(queryStr)
              }
            )

            break
          default:
            this.error =
              'Please enter a txid, a block number or an account address.'
            this.isActive = false
            this.isBlockActive = false
            this.isTransactionActive = false
            this.isAddressActive = false
            if (e == 'searchBtn') {
              this.searchQuery = ''
              this.$root.$data.sharedState.query = ''
            }
        }
      } else {
        console.log('Search block', queryStr)
        this.isBlockActive = true
        this.isTransactionActive = false
        this.isAddressActive = false
        this.isActive = true

        this.getBlock(queryStr)
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
            this.txs = response.data
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#topbar {
  position: absolute;
  width: 100%;
  top: 50%;
  transition: 0.35s all ease-out;
  left: 50%;
  transform: translate(-50%, -100px);
  padding-bottom: 100px;
}
#topbar img {
  position: relative;
  height: 60px;
  float: right;
  transition: 0.2s all ease;
  z-index: 1;
}
#topbar img:first-child {
  position: relative;

  left: 0px;
  float: left;
}
#logo {
  animation: beat 0.5s infinite alternate;
  transform-origin: center;
}
@keyframes beat {
  to {
    transform: scale(1.1);
  }
}
#search_wrapper {
  position: relative;
  padding-top: 90px;
  display: block;
}
input[type='text'] {
  width: 100%;
  /* Rectangle: */
  background: url('../assets/ic_search.png') no-repeat #ffffff;
  background-size: 20px;
  background-position: 15px 20px;
  box-shadow: 0 2px 14px 0 rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  /* Search by Address or: */
  font-size: 22px;
  text-align: center;
  border: 0px;
  height: 60px;
  color: #112f42;
  transition: 0.5s all ease;
  opacity: 1;
}
input[type='text']:hover {
  opacity: 1;
}
input[type='text']::-moz-placeholder,
input[type='text']::-webkit-input-placeholder {
  color: #a7b2b9;
}
input:focus,
button:focus {
  outline: none;
  box-shadow: 0 10px 32px 0 rgba(0, 0, 0, 0.12);
  opacity: 1;
  transform: scale(1);
}
input:focus + button {
  opacity: 1;
  transform: scale(1);
}
button {
  position: absolute;
  top: 92px;
  right: 2px;
  height: 56px;
  border-radius: 10px;
  width: 56px;
  color: white;
  background: #fe4184;
  font-size: 20px;
  font-weight: 600;
  opacity: 0;
  transition: 0.5s all ease;
  transform: scale(0.9);
  border: 0;
}
button:active {
  transform: scale(0.9);
}
p.error {
  position: absolute;
  color: #fe4184;
  transition: 0.5s opacity ease;
}
p.error.hide {
  opacity: 0;
}
#topbar.withTabbar {
  top: 10px;
  transform: translate(-50%, 0);
}
#topbar img.withTabbar {
  height: 40px;
}
#search_wrapper.withTabbar {
  padding-top: 60px;
}
#search_wrapper.withTabbar button {
  top: 63px;
}
@media (max-width: 960px) {
  #topbar img {
    height: 9vw;
  }
  #topbar {
    width: 90%;

    top: 40%;
  }

  #search_wrapper {
    padding-top: 60px;
  }
  input[type='text'] {
    width: 84%;
    text-align: left;
    text-overflow: ellipsis;
    font-size: 16px;
    padding-left: 14%;
    background-size: 15px;
    background-position: 15px 26px;
  }
}
@media (max-width: 560px) {
  #topbar img {
    height: 30px;
  }
  #topbar img.withTabbar {
    top: 0px;
    height: 25px;
  }
  #topbar img:first-child {
    left: 2%;
  }
  #topbar img {
    right: 2%;
  }
  #topbar {
    width: 95%;

    top: 48%;
  }

  #topbar.withTabbar {
    top: 10px;
  }

  #search_wrapper {
    padding-top: 50px;
  }
  #search_wrapper.withTabbar {
    padding-top: 35px;
  }
  #search_wrapper.withTabbar button#searchBtn {
    top: 35px;
  }
  input[type='text'] {
    height: 44px;
    padding: 0px;
    background-position: 14px 18px;
    background-size: 13px;
    padding-left: 34px;
    width: 87%;
  }

  button#searchBtn {
    height: 44px;
    width: 42px;
    font-size: 16px;
    font-weight: 600;
    top: 50px;
    border-bottom-left-radius: 3px;
    border-top-left-radius: 3px;
    box-shadow: 0px 2px 30px 0 rgba(254, 65, 134, 0.5);
  }
  button span {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
