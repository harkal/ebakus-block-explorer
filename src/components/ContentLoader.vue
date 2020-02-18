<template>
  <ContentLoader
    :width="width"
    :height="height"
    :style="{ height: height + 'px' }"
    preserve-aspect-ratio="xMinYMid slice"
    primary-color="#f0f0f0"
    secondary-color="#e0e0e0"
    class="loader"
  >
    <rect x="0" y="0" rx="5" ry="5" :width="width" :height="height" />
  </ContentLoader>
</template>

<script>
import { ContentLoader } from 'vue-content-loader'

export default {
  components: {
    ContentLoader,
  },
  props: {
    width: {
      type: Number,
      default: 100,
    },
    height: {
      type: Number,
      default: 11,
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@media (max-width: 560px) {
  .loader {
    width: 90%;
    padding: 0 5% !important;
    box-sizing: border-box;
  }
}
</style>
