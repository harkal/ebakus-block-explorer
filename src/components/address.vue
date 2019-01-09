<template>
  <div id="block_wrapper" v-bind:class="{ active: isAddressActive }">
    <h1>Address</h1>

    <div class="panel">
      <div class="twocol">
        <span class="address">{{addressData.address}}</span>
      </div>
      <div class="twocol right">
        <span class="balanceLabel">Balance</span>
        <span class="balance">{{balance.toFixed(4)}}</span>
        <small>ebakus</small>
      </div>
      <div class="chart_wrapper">
        <Chart v-if="chartDataLoaded" :chartData="balanceData" :height="300"></Chart>
      </div>
    </div>
    <div class="panel">
      <h2>Details</h2>
      <table>
        <tr>
          <td>Balance</td>
          <td>{{balance.toFixed(4)}}</td>
        </tr>
        <tr>
          <td>Total in</td>
          <td>{{weiToEbk(addressData.total_in).toFixed(4)}}</td>
        </tr>
        <tr>
          <td>Total out</td>
          <td>{{weiToEbk(addressData.total_out).toFixed(4)}}</td>
        </tr>
        <tr>
          <td>Block rewards</td>
          <td>{{weiToEbk(addressData.block_rewards).toFixed(4)}}</td>
        </tr>
        <tr>
          <td>Total txs</td>
          <td>{{totalTx}}</td>
        </tr>
      </table>
    </div>
    <div class="panel">
      <h2>Transactions</h2>
      <transactions
        v-bind:txs="txs"
        v-bind:address="addressData.address"
        v-bind:maxOffset="totalTx"
        v-bind:isTransactions="{active:true }"
      />
    </div>
  </div>
</template>

<script>
import Chart from "./chart";
import { timeConverter, weiToEbk } from "../utils";

export default {
  props: {
    isAddressActive: {
      type: Boolean,
      default: false
    },
    addressData: {
      type: Object
    },
    txs: {
      type: Array
    }
  },
  components: {
    Chart
  },
  data() {
    return {
      address: "",
      chartDataLoaded: false
    };
  },
  methods: {
    getBalance: function() {
      var balance = 0;
      var i = 0;
      console.log("from: " + this.addressData.from.length);
      console.log("to: " + this.addressData.space - top1.length);
      console.log(i);
    },
    timeConverter: timeConverter,
    weiToEbk: weiToEbk
  },
  created: function() {},
  watch: {
    addressData: function() {},
    txs: function() {
      this.chartDataLoaded = true;
    }
  },
  computed: {
    balance: function() {
      var balance =
        this.addressData.total_in -
        this.addressData.total_out +
        this.addressData.block_rewards;
      return this.weiToEbk(balance);
    },
    totalTx: function() {
      return this.addressData.count_in + this.addressData.count_out;
    },
    balanceData: function() {
      var i;
      var balance = 0;
      var balanceData = {};
      var _data = [];
      var _datasets = [];
      var _labels = [];
      var txs = this.txs.slice().reverse();

      for (i = 0; i < txs.length; i++) {
        _labels.push(this.timeConverter(txs[i].timestamp));
        if (txs[i].from == "this" && txs[i].to != "this") {
          balance -= this.weiToEbk(txs[i].value);
        } else if (txs[i].from != "this" && txs[i].to == "this") {
          balance += this.weiToEbk(txs[i].value);
        }

        _data.push(balance);
      }
      _labels.unshift("");
      balance = this.balance - _data[txs.length - 1];
      for (i = 0; i < txs.length; i++) {
        _data[i] += balance;
      }
      _data.unshift(balance);

      // now that we finished with number calcs, keep 4 decimals (converts to string)
      _data=_data.map(data => data.toFixed(4));

      _datasets = [
        {
          label: "Balance",
          backgroundColor: "#E4F5FD",
          borderColor: "#31BAF3",
          data: _data
        }
      ];

      balanceData = {
        labels: _labels,
        datasets: _datasets
      };

      return balanceData;
    }
  }
};
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
h3.address {
  font-size: 22px;
}
.twocol {
  display: inline-block;
  width: 49%;
  padding-bottom: 40px;
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
}
</style>
