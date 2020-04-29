<template>
  <div class="panel-wrapper">
    <h1><img src="@/assets/img/ic-ens.png" alt />Name Service</h1>
    <div class="panel">
      <h2>Register a Name for your address</h2>
    </div>
  </div>
</template>

<script>
import { store, mutations } from '@/store'
import { RouteNames } from '@/router'

import Address from '@/components/Address'
import Block from '@/components/Block'
import Transaction from '@/components/Transaction'
import { getAddressForEns, storeEnsNameForAddress } from '@/utils/ens'

export default {
  props: {},
  data() {
    return {}
  },
  computed: { RouteNames: () => RouteNames },
  watch: {},
  created: function() {},
  methods: {},
}
</script>

<style scoped lang="scss">
@import '../assets/css/variables';
</style>
