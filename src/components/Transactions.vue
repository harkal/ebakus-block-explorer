<template>
  <div id="transactions_wrapper">
    <ul class="tabResults labels">
      <li v-if="showTitle" id="list_title">
        <span class="txID">Tx hash</span>
        <span class="from">From</span>
        <span class="to">To</span>
        <span class="amount">Amount</span>
        <span class="time">Time</span>
      </li>
    </ul>
    <div class="scroll inner tx">
      <ul class="tabResults main">
        <li v-for="(tx, idx) in txs_" :key="tx.hash + ':' + idx">
          <router-link
            :to="{ name: RouteNames.SEARCH, params: { query: tx.hash } }"
          >
            <span class="mobileLabel">Tx hash</span>
            <span class="txID transaction">{{ tx.hash }}</span>
            <span class="mobileLabel">From</span>
            <span class="address">{{ tx.from }}</span>
            <img
              src="../assets/ic_from_to.png"
              alt
              :class="{ outgoing: tx.from == 'this' && tx.to != 'this' }"
            />
            <span class="mobileLabel">To</span>
            <span class="address">{{ tx.to }}</span>
            <span class="mobileLabel">Amount</span>
            <span
              class="amount_"
              :class="{
                outgoing: tx.from == 'this' && tx.to != 'this',
                incoming: tx.from !== 'this' && tx.to == 'this',
              }"
              >{{ weiToEbk(tx.value).toFixed(4) }} ebakus</span
            >
            <span class="mobileLabel timestamp">Time</span>
            <span class="time">{{ timeConverter(tx.timestamp) }}</span>
          </router-link>
        </li>
      </ul>

      <button
        v-if="numberOfRemainingTxs > 0 || showingLatestTxs"
        @click="loadTransactions()"
      >
        Show {{ numberOfRemainingTxs > 0 ? numberOfRemainingTxs : '' }} More
      </button>
    </div>
  </div>
</template>

<script>
import { RouteNames } from '@/router'
import { timeConverter, weiToEbk, isZeroHash } from '../utils'

export default {
  props: {
    address: {
      type: String,
      default: '',
    },
    blockHash: {
      type: String,
      default: '',
    },
    maxOffset: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      txs: [],
      showTitle: false,
      offset: 0,
      showingLatestTxs: false,
    }
  },
  computed: {
    RouteNames: () => RouteNames,

    txs_: function() {
      var txs = this.txs
      if (typeof this.address !== 'undefined' && this.address != '') {
        var i
        var address = this.address.toLowerCase()
        for (i = 0; i < txs.length; i++) {
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
      if (to.name !== from.name) this.reloadFresh()
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
    weiToEbk: weiToEbk,

    reloadFresh() {
      this.txs = []
      this.showTitle = false
      this.showingLatestTxs = false
      this.offset = 0

      this.loadTransactions()
    },
    loadTransactions() {
      const self = this
      var offset_tmp = this.offset > 0 ? this.offset + 20 : 0

      // get txs for address
      if (typeof this.address !== 'undefined' && this.address != '') {
        this.$http
          .get(
            process.env.API_ENDPOINT +
              '/transaction/all/' +
              this.address +
              '?offset=' +
              offset_tmp +
              '&limit=20&order=desc'
          )
          .then(
            function(response) {
              var new_txs = response.data
              self.txs.push.apply(self.txs, new_txs)
              self.offset += 20
            },
            function(err) {
              console.error(
                `Failed to load transactions for address "${this.address}":`,
                err
              )
            }
          )

        // get txs for block
      } else if (
        typeof this.blockHash !== 'undefined' &&
        this.blockHash != ''
      ) {
        this.$http
          .get(
            process.env.API_ENDPOINT + '/transaction/block/' + this.blockHash
          )
          .then(
            function(response) {
              var new_txs = response.data
              self.txs.push.apply(self.txs, new_txs)
              self.offset += 20
            },
            function(err) {
              console.error(
                `Failed to load transactions for block "${this.blockHash}":`,
                err
              )
            }
          )
      } else {
        this.$http
          .get(
            process.env.API_ENDPOINT +
              '/transaction/latest?offset=' +
              offset_tmp +
              '&limit=10&order=desc'
          )
          .then(
            function(response) {
              var newTxs = response.data
              self.txs.push.apply(self.txs, newTxs)
              self.offset += 10
              self.showingLatestTxs = newTxs.length > 0
            },
            err => {
              console.error('Failed to load latest transactions', err)
            }
          )
      }
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
button {
  position: relative;
  display: block;
  margin-top: 20px;
  border-radius: 10px;
  padding: 20px 25px;
  color: white;
  background: #fe4184;
  font-size: 18px;
  font-weight: 600;
  width: 100%;
  margin: 0 auto;
  transition: 0.5s all ease;
  transform: scale(1);
  border: 0;
  cursor: pointer;
}
*:focus {
  outline: none;
}
button:hover {
  transform: scale(0.98);
}
#transactions_wrapper {
  display: none;
  height: 50px;
  height: 100%;
}
#transactions_wrapper.active {
  opacity: 1;
  display: block;
}
.container {
  margin: 0 auto;
}
img.outgoing {
  filter: hue-rotate(180deg);
}
span.amount_.outgoing {
  color: deeppink;
}
span.amount_.incoming {
  color: darkturquoise;
}
ul {
  list-style: none;

  width: 99%;
  padding: 0px;
}
li {
  /* block_list_item: */
  width: 97%;
}
li a {
  display: block;
  padding: 90px 1%;
  padding: 22px 1%;
  border-radius: 10px;
  transition: 0.1s all ease-in-out;
  text-decoration: none;
  color: #34393d;
  opacity: 0.85;
}
li a:visited {
  color: #112f42;
}
li a:hover {
  box-shadow: 0 2px 33px 0 rgba(17, 47, 66, 0.1);
  opacity: 1;
  background: #fff;
}
li span {
  display: inline-block;
  width: 19%;
  margin: 0 1%;
  text-align: center;
  text-overflow: ellipsis;
  overflow: hidden;
}
li span:first-child {
  text-align: left;
  margin: 0;
}
li span:last-child {
  text-align: right;
  margin: 0;
  width: 10%;
  vertical-align: top;
}
span.amount_ {
  font-weight: 600;
  color: #34393d;
}

span.time {
  font-size: 13px;
}

img {
  width: 16px;
  vertical-align: 6px;
}
#list_title {
  padding: 0px 10px;
}
#list_title span {
  font-size: 14px;
  color: #828383 !important;
  font-weight: 400;
  opacity: 0.8;
}
.scroll {
  overflow: auto;
  height: 100%;
  -webkit-overflow-scrolling: touch;
}
.mobileLabel {
  display: none;
}
@media (max-width: 560px) {
  ul#tabbarOptions {
    width: 460px;
  }
  ul.tabResults.main {
    width: 100%;
  }
  ul.tabResults.main li {
    width: 100%;
    display: block;
  }

  li a {
    position: relative;
    opacity: 1;
    background: #fff;
    margin-left: 0px;
    width: 610px;
    width: 100vw;
    margin-bottom: 10px;
    padding-bottom: 45px;
    border-bottom: 2px solid #f0f0f0;
    border-radius: 0px !important;
  }
  li {
    width: 100vw;
    overflow: hidden;
  }

  li span {
    text-align: left;
    margin: 0px;
  }

  .txID.transaction {
    display: block;
    width: 75%;
    text-overflow: ellipsis;

    font-size: 14px;
    padding-left: 80px;
  }
  .amount,
  time {
    width: 50%;
    padding-left: 60px;
  }
  .address {
    width: 550px;
    width: 80%;
    text-overflow: ellipsis;
    font-size: 14px;
    line-height: 14px;
    padding-left: 80px;
  }
  li img {
    transform: rotate(90deg) scale(0.9);
    display: none;
  }
  .tabResults.labels {
    display: none;
  }

  #transactions_wrapper li:last-child {
    padding-bottom: 50px;
  }

  li span.time,
  li span.amount_ {
    display: block;
    position: absolute;
    width: 600px;
    text-align: left;
    padding-left: 80px;
  }
  li span.amount_ {
    font-size: 14px;
  }
  li span.time {
    padding-top: 17px;
    padding-left: 80px;
    opacity: 0.5;
  }
  .mobileLabel.timestamp {
    margin-top: 17px;
  }
  a:hover {
    box-shadow: none;
  }
  body {
    -webkit-text-size-adjust: 100%;
  }
  .mobileLabel {
    display: block;
    width: 70px;
    font-size: 13px;
    position: absolute;
    left: 0px;
    padding-left: 10px !important;
    margin-bottom: 10px;
    background: #fff;
  }
}
</style>
