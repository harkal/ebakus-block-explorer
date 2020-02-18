<template>
  <div id="blocks_wrapper">
    <ul class="tabResults labels">
      <li id="list_title">
        <span class="blockID">Block #</span>
        <span class="transaction">Transactions</span>
        <span class="gas_title">Gas used</span>
        <span class="producer">Produced by</span>
        <span class="time">Time</span>
      </li>
    </ul>
    <div class="scroll inner">
      <ul class="tabResults main">
        <li
          v-for="index in blocks.length == 0 ? 4 : 0"
          :key="index"
          class="placeholder"
        >
          <span class="mobileLabel">Block #</span>
          <span class="blockID"><ContentLoader :width="90"/></span>
          <span class="mobileLabel">Tx count</span>
          <span class="transaction">
            <strong><ContentLoader :width="14" fixed/></strong> transactions
          </span>
          <span class="mobileLabel">Gas used</span>
          <progress :value="0" max="100">0 %</progress>
          <span class="mobileLabel">Produced by</span>
          <span class="producer"><ContentLoader :width="120"/></span>
          <span class="mobileLabel">Timestamp</span>
          <span class="time"><ContentLoader :width="80"/></span>
        </li>
        <li v-for="block in blocks" :key="block.number">
          <router-link
            :to="{
              name: RouteNames.SEARCH,
              params: { query: String(block.number) },
            }"
          >
            <span class="mobileLabel">Block #</span>
            <span class="blockID">{{ block.number }}</span>
            <span class="mobileLabel">Tx count</span>
            <span class="transaction">
              <strong>{{ block.transactionCount }}</strong> transactions
            </span>
            <span class="mobileLabel">Gas used</span>
            <progress :value="block.gasUsed" max="100"
              >{{ block.gasUsed }} %</progress
            >
            <span class="mobileLabel">Produced by</span>
            <span class="producer">{{ block.producer }}</span>
            <span class="mobileLabel">Timestamp</span>
            <span class="time">{{ timeConverter(block.timestamp) }}</span>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mutations } from '@/store'
import { RouteNames } from '@/router'
import { timeConverter } from '@/utils'

import ContentLoader from './ContentLoader'

export default {
  components: {
    ContentLoader,
  },
  data() {
    return {
      showTitle: false,
      blocks: [],
    }
  },
  computed: {
    RouteNames: () => RouteNames,
  },
  watch: {
    $route(to, from) {
      if (to.name !== from.name && to.name === RouteNames.BLOCKS)
        this.getLatestBlocks()
    },
    blocks: function() {
      if (this.blocks.length > 0) {
        this.showTitle = true
      }
    },
  },
  created: function() {
    this.getLatestBlocks()
  },
  // created: function() {},
  methods: {
    timeConverter: timeConverter,
    getLatestBlocks: async function() {
      try {
        const res = await this.$http.get(
          process.env.API_ENDPOINT + '/block/-1?range=10'
        )

        this.blocks = res.data

        mutations.setBlockHeight(this.blocks[0].number)
      } catch (err) {
        console.error('Failed to load latest blocks', err)
      }
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#blocks_wrapper {
  display: none;
  height: 50px;
  height: 100%;
}
#blocks_wrapper.active {
  opacity: 1;
  display: block;
}
.container {
  margin: 0 auto;
}

li.placeholder {
  padding: 22px 1%;
}

li a {
  display: block;
  padding: 22px 1%;
  border-radius: 10px;
  transition: 0.1s all ease-in-out;
  text-decoration: none;
  color: #112f42;
  opacity: 0.85;
}
li a:visited {
  color: #112f42;
}
li a:hover {
  box-shadow: 0 2px 33px 0 rgba(17, 47, 66, 0.1);
  opacity: 1;
}
li span {
  display: inline-block;
  width: 16%;
  margin: 0 1%;
  text-align: center;
  vertical-align: middle;
}
.blockID {
  text-align: left;
  margin: 0;
}
li span:last-child {
  text-align: right;
  margin: 0;
  width: 10%;
}
progress {
  width: 26%;
  margin: 0 3%;
  vertical-align: 2px;
  background: #95a0a7;
  height: 4px;
  border-radius: 2px;
}
progress::-webkit-progress-bar {
  background: #f0f0f0;
  height: 4px;
  border-radius: 2px;
}
progress::-webkit-progress-value {
  background: #95a0a7;
  height: 4px;
  border-radius: 2px;
}
progress::-moz-progress-bar {
  background: #fff;
}
span.blockID {
  font-weight: 600;
}
span.producer {
  text-overflow: ellipsis;
  overflow: hidden;
}
span.producer,
span.time {
  font-size: 13px;
}
span.transaction {
  font-weight: 300;
}
#list_title {
  padding: 0px 1%;
}
#list_title span {
  font-size: 14px;
  color: #828383 !important;
  font-weight: 400;
  opacity: 0.8;
}
.gas_title {
  width: 26%;
  margin: 0 3%;
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
  li {
    width: 100vw;
    overflow: hidden;
  }
  li span {
    display: block;
    width: 100vw;
    margin: 0px;
  }
  li span:first-child {
    margin: 0px;
  }
  .blockID {
    padding-left: 80px;
    width: 100px;
  }

  li span.time {
    width: 200px;
    text-align: left;
  }
  li.placeholder,
  a {
    position: relative;
    width: 100%;
    overflow: hidden;

    border-bottom: 2px solid #f0f0f0;
  }
  li span {
    font-size: 14px;
    text-align: left;
    padding-left: 80px;
    font-weight: 600;
  }
  .mobileLabel {
    display: inline-block;
    width: 70px;
    font-size: 13px;
    margin-bottom: 10px !important;
    position: absolute;
    left: 0px;
    padding-left: 10px !important;
    background: #fff;
    font-weight: 400;
  }
  progress {
    margin: 7px 90px 3px 80px;
    width: 60%;
  }
  li span.transaction {
    color: #fff;
  }
}
</style>
