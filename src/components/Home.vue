<template>
  <div class="page-wrapper active">
    <section>
      <h1><img src="@/assets/img/ic-stats.svg" alt />Statistics</h1>
      <div class="panel">
        <div class="widget-wrapper">
          <div class="widget">
            <img src="@/assets/img/ic_blocks.png" alt />
            <h3>BLOCKS</h3>
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
            <h3>EBK SENT</h3>
            <h2 v-if="blockData.gasUsed >= 0">{{ gasUsed }}%</h2>
            <ContentLoader v-else :width="100" :height="20" />
            <progress :value="gasUsed" max="100">{{ gasUsed }}%</progress>
          </div>
        </div>
      </div>
    </section>

    <section>
      <RegisterEns />
    </section>
  </div>
</template>

<script>
import ContentLoader from './ContentLoader'
import RegisterEns from './RegisterEns'
import { RouteNames } from '@/router'
import { timeConverter } from '@/utils'

export default {
  components: {
    ContentLoader,
    RegisterEns,
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

<style scoped lang="scss">
@import '../assets/css/variables';

.widget {
  a.left-arrow {
    position: absolute;
    top: 34px;
    left: 30px;
  }
  a.right-arrow {
    position: absolute;
    top: 34px;
    right: 30px;
  }
}

progress {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
}

@media (max-width: $mobile-grid-breakpoint) {
  .loader {
    padding: 0 5% !important;
  }
}
</style>
