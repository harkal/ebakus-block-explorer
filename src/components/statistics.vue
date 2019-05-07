<template>
  <div id="statistics_wrapper" :class="{ active: isStatistics.active }">
    <ul class="tabResults labels">
      <li v-if="showTitle" id="list_title">
        <span class="delegateID">#</span>
        <span class="producer">Producer</span>
        <span class="stake">Stake</span>
        <span class="missedBlocks">Missed blocks</span>
        <span class="density">Density</span>
        <span class="time">Period</span>
      </li>
    </ul>
    <div v-if="isLoaded" class="scroll inner">
      <ul class="tabResults main">
        <li v-for="(delegate, idx) in delegates_" :key="idx">
          <router-link :to="{ path: '/search/' + delegate.address }">
            <span class="mobileLabel">#</span>
            <span class="delegateID">{{ idx }}</span>
            <span class="mobileLabel">Produced by</span>
            <span class="producer address">{{ delegate.address }}</span>
            <span class="mobileLabel">Stake</span>
            <span class="stake">{{ delegate.stake }}</span>
            <span class="mobileLabel">Missed blocks</span>
            <span class="missedBlocks">
              <p
                v-for="(data, idxData) in delegate.data"
                :key="idxData"
                :class="{ danger: data.missedBlocks > 0 }"
              >
                {{ data.missedBlocks }}
                <small>within last {{ data.timeExamined }}</small>
              </p>
            </span>
            <span class="mobileLabel">Density</span>
            <span class="density">
              <p v-for="(data, idxData) in delegate.data" :key="idxData">
                {{ data.density.toFixed(2) }}%
                <small>within last {{ data.timeExamined }}</small>
              </p>
            </span>
            <span class="time">
              <p v-for="(data, idxData) in delegate.data" :key="idxData">
                <small>({{ data.timeExamined }})</small>
              </p>
            </span>
          </router-link>
        </li>
      </ul>
    </div>
    <div v-if="!isLoaded">Loading...</div>
  </div>
</template>

<script>
import { weiToEbk } from '../utils'

export default {
  props: {
    isStatistics: {
      type: Object,
      default: () => ({}),
    },
    stats: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      showTitle: false,
      isLoaded: false,
    }
  },
  computed: {
    delegates_: function() {
      return this.stats.delegates.map(delegate => {
        const data = delegate.map(period => {
          let label = 'minutes'
          let time = period.seconds_examined / 60
          if (time >= 60) {
            label = 'hour'
            time = 60 / 60
          }

          return {
            timeExamined: `${time} ${label}`,
            totalBlocks: period.total_blocks,
            missedBlocks: period.missed_blocks,
            density: period.density * 100,
          }
        })

        const delegateInfo = delegate[delegate.length - 1]

        return {
          address: delegateInfo.address,
          // get stake from any period, it's the same
          stake: delegateInfo.stake,
          data,
        }
      })
    },
  },
  watch: {
    stats: function() {
      this.isLoaded = true
      this.showTitle = true
    },
  },
  created: function() {},
  methods: {
    weiToEbk: weiToEbk,
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#statistics_wrapper {
  display: none;
  height: 50px;
  height: 100%;
}
#statistics_wrapper.active {
  opacity: 1;
  display: block;
}
.container {
  margin: 0 auto;
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
  width: 10%;
  margin: 0 1%;
  text-align: center;
  vertical-align: middle;
}
.delegateID {
  width: 6%;
  text-align: left;
  margin: 0;
}
span.delegateID {
  font-weight: 600;
}
span.producer {
  width: 42%;
  margin: 0;
  text-overflow: ellipsis;
  overflow: hidden;
}
.missedBlocks small,
.density small {
  display: none;
}
.missedBlocks p,
.density p {
  margin-top: 0;
  margin-bottom: 0;
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
.scroll {
  overflow: auto;
  height: 100%;
  -webkit-overflow-scrolling: touch;
}
.mobileLabel {
  display: none;
}
.danger {
  color: #f44336;
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
  span.producer {
    width: calc(100% - 80px);
  }
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
  .missedBlocks small,
  .density small {
    display: inline-block;
    color: #112f42;
  }
  .time {
    display: none;
  }
}
</style>
