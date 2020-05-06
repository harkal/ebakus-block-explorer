<template>
  <ContentLoader
    :width="width"
    :height="height"
    :style="{ height: height + 'px' }"
    preserve-aspect-ratio="xMinYMid slice"
    primary-color="#f0f0f0"
    secondary-color="#e0e0e0"
    :class="{ loader: !fixed }"
  >
    <rect
      x="0"
      y="0"
      :rx="radius"
      :ry="radius"
      :width="width"
      :height="height"
    />
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
      default: 12,
    },
    radius: {
      type: Number,
      default: 3,
    },
    fixed: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style scoped lang="scss">
@import '../assets/css/variables';
@media (max-width: 560px) {
  .loader {
    width: 90%;
    padding: 0 $spacer-1 0 0 !important;
    box-sizing: border-box;
  }
}
</style>
