<template>
  <div class="panel-wrapper">
    <h1><img src="@/assets/img/ic-ens.png" alt />Name Service</h1>
    <div class="panel">
      <h2>Register a Name for your address</h2>

      <div class="row">
        <label for="name">Name</label>
        <input v-model="name" type="text" />
      </div>
      <div class="row">
        <label for="address">Address</label>
        <input v-model="address" type="text" />
      </div>

      <div v-if="error" class="row txt-error">
        {{ error }}
      </div>

      <div class="row">
        <button @click="registerEns">Register</button>
      </div>
    </div>
  </div>
</template>

<script>
import { registerNameForAddress, storeEnsNameForAddress } from '@/utils/ens'
import { web3 } from '@/utils/web3ebakus'

export default {
  data() {
    return {
      name: '',
      address: '',
      error: '',
    }
  },
  watch: {
    name: function() {
      this.error = ''
    },
    address: function() {
      this.error = ''
    },
  },
  methods: {
    registerEns: async function() {
      this.error = ''

      if (!this.name) {
        this.error = 'Please set a valid name.'
        return
      }

      if (!this.address || !web3.utils.isAddress(this.address)) {
        this.error = 'Please set a valid address.'
        return
      }

      try {
        await registerNameForAddress(this.name, this.address)

        await storeEnsNameForAddress(this.name, this.address)
      } catch (err) {
        this.error = 'Something went wrong.'
      }
    },
  },
}
</script>

<style scoped lang="scss">
@import '../assets/css/variables';

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  margin-bottom: $spacer-3;
}

label {
  position: relative;
  width: 120px;
  margin: 0;
  padding: 0 0 $spacer-2;
}

input {
  display: block;
  flex-shrink: 1;
  flex-grow: 1;
  max-width: 540px;
  height: 45px;
  padding: $spacer-1 $spacer-3;

  font-size: 16px;

  @media (max-width: $mobile-grid-breakpoint) {
    height: 32px;
    font-size: 14px;
  }
}

.txt-error,
button {
  margin-left: 120px;
}

button {
  padding: $spacer-2 $spacer-4;
  border-radius: 0;
  font-size: 18px;
  font-weight: 600;
}
</style>
