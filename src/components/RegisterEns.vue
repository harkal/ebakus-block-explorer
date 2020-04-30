<template>
  <div class="panel-wrapper">
    <h1><img src="@/assets/img/ic-ens.svg" alt />Name Service</h1>
    <div class="panel">
      <h2>Register a Name for your address</h2>

      <div class="row">
        <label for="name">Name</label>
        <input v-model="name" type="text" autocomplete="off" />
      </div>
      <div class="row">
        <label for="address">Address</label>
        <input v-model="address" type="text" autocomplete="off" />
      </div>

      <div v-if="isEbakusWalletAllowed" class="row buttons">
        <button @click="registerEns">
          Register
        </button>

        <span
          v-if="error !== '' || walletError !== ''"
          key="error"
          class="txt-error"
        >
          {{ error || walletError }}
        </span>
        <span v-if="warning !== ''" key="warning" class="txt-warning">
          {{ warning }}
        </span>

        <strong v-if="registered" key="registered">
          Registered successfully!
        </strong>
      </div>

      <div v-if="!isEbakusWalletAllowed" class="row buttons">
        <button @click="allowEbakusWallet">Allow wallet</button>
        <span class="txt-warning">
          In order to register an ENS name, you have to allow ebakus wallet to
          store browser cookies.
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import SharedWalletMixin from '@/mixins/SharedWalletMixin'
import { store } from '@/store'
import { registerNameForAddress, storeEnsNameForAddress } from '@/utils/ens'
import { web3 } from '@/utils/web3ebakus'
import { waitUntil } from '../utils'

export default {
  mixins: [SharedWalletMixin],
  data() {
    return {
      name: '',
      address: '',
      registered: false,
      warning: '',
      error: '',
    }
  },
  computed: { hasUserConsented: () => store.hasUserConsented },
  watch: {
    name: function() {
      this.error = ''
    },
    address: function() {
      this.error = ''
    },
    registered: function(val) {
      const self = this
      if (val) {
        setTimeout(function() {
          self.registered = false
        }, 6000)
      }
    },
  },
  methods: {
    registerEns: async function() {
      const self = this

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
        // check if locked
        const from = await this.ebakusWalletFetchAccount()

        if (!from) {
          this.warning = 'Please unlock the wallet first.'

          await waitUntil(() => self.walletAddress !== null)

          this.warning = ''
        }

        const success = await registerNameForAddress(this.name, this.address)

        if (success) {
          await storeEnsNameForAddress(this.name, this.address)

          this.name = ''
          this.address = ''
          this.error = ''
          this.registered = true
        } else {
          this.error = 'Something went wrong. Please try again.'
        }
      } catch (err) {
        console.log('err', err)
        this.error = 'Something went wrong. Please try again.'
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

.buttons {
  margin-left: 120px;

  strong,
  span {
    display: block;
    max-width: 400px;
    margin-left: $spacer-3;
  }
}

button {
  padding: $spacer-2 $spacer-4;
  border-radius: 0;
  font-size: 18px;
  font-weight: 600;
}
</style>
