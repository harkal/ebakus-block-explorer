<template>
  <div class="panel-wrapper">
    <h1><img src="@/assets/img/ic-stats.svg" alt />Statistics</h1>
    <div class="panel">
      <div class="widget-wrapper">
        <div class="widget">
          <img src="@/assets/img/ic-block.svg" alt />
          <h3>BLOCKS</h3>

          <ContentLoader :width="100" :height="20" />
        </div>

        <div class="widget">
          <img src="@/assets/img/ic-transaction.svg" alt />
          <h3>TRANSACTIONS</h3>

          <ContentLoader :width="100" :height="20" />
        </div>
        <div class="widget">
          <img src="@/assets/img/ic-transaction.svg" alt />
          <h3>EBK SENT</h3>

          <ContentLoader :width="100" :height="20" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ContentLoader from './ContentLoader'

export default {
  components: { ContentLoader },
  props: {},
  data() {
    return {}
  },
  watch: {},
  created: function() {},
  methods: {},
}
</script>

<style scoped lang="scss">
@import '../assets/css/variables';
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
