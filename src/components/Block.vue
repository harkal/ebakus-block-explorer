<template>
  <div id="block_wrapper">
    <h1><img src="@/assets/img/ic_blocks.png" class="title_img" alt />Block</h1>
    <div class="panel">
      <div class="widget_wrapper">
        <div class="widget">
          <img src="@/assets/img/ic_blocks.png" alt />
          <h3>BLOCK #</h3>
          <router-link
            class="left"
            :to="{ name: RouteNames.SEARCH, params: { query: previousBlock } }"
          >
            <img src="@/assets/img/ic_prev.png" alt />
          </router-link>
          <router-link
            class="right"
            :to="{ name: RouteNames.SEARCH, params: { query: nextBlock } }"
          >
            <img src="@/assets/img/ic_next.png" alt />
          </router-link>
          <h2 v-if="blockData.number">{{ blockData.number }}</h2>
          <ContentLoader v-else :width="100" :height="20" />
        </div>

        <div class="widget">
          <img src="@/assets/img/ic_transactions.png" alt />
          <h3>TRANSACTIONS</h3>
          <h2 v-if="blockData.transactionCount >= 0">
            {{ blockData.transactionCount }}
          </h2>
          <ContentLoader v-else :width="100" :height="20" />
        </div>
        <div class="widget">
          <img src="@/assets/img/ic_gas.png" alt />
          <h3>GAS USED</h3>
          <h2 v-if="blockData.gasUsed >= 0">{{ gasUsed }}%</h2>
          <ContentLoader v-else :width="100" :height="20" />
          <div class="progress_wrapper">
            <div class="progress" :style="gasUsedCss"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="panel">
      <h2>Details</h2>
      <div class="tablewrapper">
        <table>
          <tr>
            <td class="headcol">Hash</td>
            <td class="long">
              <strong v-if="hasData">{{ blockData.hash }}</strong>
              <ContentLoader v-else :width="300" />
            </td>
          </tr>
          <tr>
            <td class="headcol">Size</td>
            <td class="long">
              <strong v-if="hasData">{{ size }}</strong>
              <ContentLoader v-else :width="100" />
            </td>
          </tr>
          <tr>
            <td class="headcol">Timestamp</td>
            <td class="long">
              <span v-if="hasData">{{
                timeConverter(blockData.timestamp)
              }}</span>
              <ContentLoader v-else :width="100" />
            </td>
          </tr>
          <tr>
            <td class="headcol">Produced by</td>
            <td class="long">
              <span v-if="hasData" class="account">
                <router-link
                  :to="{
                    name: RouteNames.SEARCH,
                    params: { query: blockData.producer },
                  }"
                  :title="blockData.producer"
                >
                  {{ blockData | toENS('producer') }}
                </router-link>
              </span>
              <ContentLoader v-else :width="300" />
            </td>
          </tr>
          <tr>
            <td class="headcol">Gas used</td>
            <td class="long">
              <span v-if="hasData">{{ blockData.gasUsed }}</span>
              <ContentLoader v-else :width="100" />
            </td>
          </tr>
          <tr>
            <td class="headcol">Gas limit</td>
            <td class="long">
              <span v-if="hasData">{{ blockData.gasLimit }}</span>
              <ContentLoader v-else :width="100" />
            </td>
          </tr>
          <tr>
            <td class="headcol">Tx Root</td>
            <td class="long">
              <span v-if="hasData">{{ blockData.transactionsRoot }}</span>
              <ContentLoader v-else :width="300" />
            </td>
          </tr>
          <tr>
            <td class="headcol">Parent Hash</td>
            <td class="long">
              <span v-if="hasData">{{ blockData.parentHash }}</span>
              <ContentLoader v-else :width="300" />
            </td>
          </tr>
          <tr>
            <td class="headcol">Delegates</td>
            <td class="long">
              <ul v-if="hasData" class="unstyled">
                <li
                  v-for="(delegate, idx) in blockData.delegates"
                  :key="idx"
                  class="account"
                >
                  <router-link
                    :to="{
                      name: RouteNames.SEARCH,
                      params: { query: delegate },
                    }"
                    >{{ delegate }}</router-link
                  >
                </li>
              </ul>
              <ContentLoader v-else :width="300" :height="48" />
            </td>
          </tr>
        </table>
      </div>
    </div>

    <div v-if="blockData.hash && txs.length > 0" class="panel">
      <h2>Transactions</h2>
      <Transactions
        :class="{ active: true }"
        :max-offset="blockData.transactionCount"
        :block-hash="blockData.hash"
        :txs="txs"
      />
    </div>
  </div>
</template>

<script>
import ContentLoader from './ContentLoader'
import Transactions from './Transactions'
import { RouteNames } from '@/router'
import { timeConverter } from '@/utils'

export default {
  components: {
    ContentLoader,
    Transactions,
  },
  props: {
    blockData: {
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
      previousBlock: 1,
      nextBlock: 0,

      // txcount: 0,
    }
  },
  computed: {
    RouteNames: () => RouteNames,
    gasUsed: function() {
      if (this.blockData.gasLimit > 0 && this.blockData.gasUsed > 0)
        return (
          (this.blockData.gasUsed / this.blockData.gasLimit) *
          100
        ).toFixed(1)
      else return 0
    },
    gasUsedCss: function() {
      return 'width: ' + this.gasUsed + '%;'
    },
    size() {
      if (parseFloat(this.blockData.size) >= 1024)
        return this.blockData.size / 1024 + 'KB'
      else if (parseFloat(this.blockData.size) > 1048576)
        return this.blockData.size / 1048576 + 'MB'
      else return this.blockData.size + ' Bytes'
    },
    hasData() {
      return !!this.blockData.hash
    },
  },
  watch: {
    blockData: function() {
      if (this.blockData.number > 0) {
        this.previousBlock = (this.blockData.number - 1).toString()
      }
      this.nextBlock = (this.blockData.number + 1).toString()
    },
    // txs: function() {
    //   this.txcount = this.txs.length
    // },
  },
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
a.btn {
  background: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(17, 47, 66, 0.09);
  border-radius: 10px;
  padding: 0px 14px 2px 14px;
  margin: 0px 15px;
  vertical-align: 3px;
  transition: 0.2s all ease-out;
  transform: scale(0.95);
}

a.btn:hover {
  box-shadow: 0 2px 17px 0 rgba(17, 47, 66, 0.17);
}
a.btn:active {
  transform: scale(0.95);
}

a.btn img {
  height: 10px;
  text-align: center;
  vertical-align: 3px;
}
#block_wrapper {
  opacity: 0;
}
#block_wrapper.active {
  opacity: 1;
  display: block;
}

div.blockMeta td {
  color: #5b5b5b;
}
div.blockMeta td:last-child {
  font-weight: 500;
}
a {
  text-decoration: none;
}
h2 {
  margin-left: 20px;
  margin-bottom: 0px;
}

.widget_wrapper {
  display: flex;
  flex-wrap: wrap;
  align-content: stretch;
  height: 190px;
}
.widget {
  position: relative;
  padding: 20px 0px;
  border: 1px solid #edeef0;
  text-align: center;
  flex-grow: 1;
  margin: 10px;
}
.widget img:first-child {
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
}
.widget h3 {
  position: absolute;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 13px;
  font-weight: 600;
}
.widget h2,
.widget svg {
  position: absolute;
  bottom: 40px;
  left: 50%;
  margin: 0px;
  padding: 0px;
  transform: translateX(-50%);
  font-size: 32px;
  font-weight: 600;
  color: #34393d;
}
.widget img {
  height: 16px;
}
.widget a.left {
  position: absolute;
  top: 34px;
  left: 30px;
}
.widget a.right {
  position: absolute;
  top: 34px;
  right: 30px;
}
.progress_wrapper {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  background: #cff9ed;
  height: 4px;
}
.progress {
  background: #66eec7;
  width: 10%;
  height: 4px;
}
@media (max-width: 560px) {
  .widget_wrapper {
    flex-direction: column;
    height: 550px !important;
  }

  .loader {
    padding: 0 5% !important;
  }
}
</style>
