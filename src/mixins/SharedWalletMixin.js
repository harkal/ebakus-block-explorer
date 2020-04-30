import Vue from 'vue'
import ebakusWallet from 'ebakus-web-wallet-loader'
import { debounce } from 'lodash'

import { setProvider, checkConnectionError } from '@/utils/web3ebakus'
import { resetEnsContract } from '@/utils/ens'
import { resetSystemContract } from '@/utils/systemContract'
import { store, mutations } from '@/store'

const noop = () => {}
const asyncNoop = async () => {}

const DEBOUNCE_DELAY = 1000

const sharedData = Vue.observable({
  _web3Endpoint: process.env.WEB3JS_NODE_ENDPOINT,
  _web3Connecting: false,
  _isWalletConnected: false,

  isEbakusWalletLoaded: false,

  walletStatus: null,
  walletAddress: null,
  walletStaked: null,

  walletError: '',
})

const useSharedData = field => ({
  get: () => sharedData[field],
  set: val => {
    sharedData[field] = val
  },
})

export default {
  computed: {
    _web3Endpoint: useSharedData('_web3Endpoint'),
    _web3Connecting: useSharedData('_web3Connecting'),
    _isWalletConnected: useSharedData('_isWalletConnected'),
    isEbakusWalletLoaded: useSharedData('isEbakusWalletLoaded'),
    walletStatus: useSharedData('walletStatus'),
    walletAddress: useSharedData('walletAddress'),
    walletStaked: useSharedData('walletStaked'),
    walletError: useSharedData('walletError'),

    hasUserConsented: () => store.hasUserConsented,
    isEbakusWalletAllowed: () => store.ebakusWalletAllowed,
  },
  watch: {
    isEbakusWalletAllowed: function(val, oldVal) {
      if (val && val !== oldVal) {
        this.ebakusWalletInit()
      }
    },
  },
  mounted: function() {
    if (this.isEbakusWalletAllowed) {
      this.ebakusWalletInit()
    } else {
      // it will not open wallet if not allowed,
      // it will just set web3 connection
      this.ebakusWalletConnect()
    }
  },
  beforeDestroy: function() {
    window.removeEventListener(
      'ebakusCurrentProviderEndpoint',
      this._ebakusWalletCurrentProviderEndpointListener
    )

    window.removeEventListener(
      'ebakusConnectionStatus',
      this._ebakusWalletConnectionStatusListener
    )

    window.removeEventListener(
      'ebakusAccount',
      this._ebakusWalletAccountListener
    )

    window.removeEventListener('ebakusStaked', this._ebakusWalletStakedListener)
  },
  methods: {
    /* User will allow wallet to store cookies */
    allowEbakusWallet: function() {
      mutations.setAllowEbakusWallet(true)
    },

    ebakusWalletInit: function() {
      if (!this.isEbakusWalletAllowed) return

      window.addEventListener(
        'ebakusCurrentProviderEndpoint',
        this._ebakusWalletCurrentProviderEndpointListener
      )

      window.addEventListener(
        'ebakusConnectionStatus',
        this._ebakusWalletConnectionStatusListener
      )

      window.addEventListener(
        'ebakusAccount',
        this._ebakusWalletAccountListener
      )

      window.addEventListener('ebakusStaked', this._ebakusWalletStakedListener)

      if (!this.isEbakusWalletLoaded) {
        this.isEbakusWalletLoaded = true

        const opts = {}
        if (process.env.WALLET_ENDPOINT) {
          opts.walletEndpoint = process.env.WALLET_ENDPOINT
        }

        if (!ebakusWallet.isWalletFrameLoaded()) {
          ebakusWallet.init(opts)
        } else {
          this.ebakusWalletConnect()
        }
      } else {
        this.ebakusWalletOnConnectSuccess()
      }
    },

    ebakusWalletCurrentProviderEndpointChanged: function(endpoint) {},
    _ebakusWalletCurrentProviderEndpointListener: function({
      detail: endpoint,
    }) {
      this._web3Endpoint = endpoint

      this.ebakusWalletCurrentProviderEndpointChanged(endpoint)

      this.ebakusWalletResetConnection()
      this.ebakusWalletConnect()
    },

    ebakusWalletConnectionStatusChanged: function(status) {},
    _ebakusWalletConnectionStatusListener: function({ detail: status }) {
      this.walletStatus = status

      this.ebakusWalletConnectionStatusChanged(status)

      this.ebakusWalletResetConnection()

      if (status == 'connected') {
        this.ebakusWalletConnect()
      }
    },

    ebakusWalletAccountChanged: function(address) {},
    _ebakusWalletAccountListener: function({ detail: address }) {
      this.walletAddress = address

      this.ebakusWalletAccountChanged(address)
    },

    ebakusWalletStakedChanged: function(staked) {},
    _ebakusWalletStakedListener: function({ detail: staked }) {
      this.walletStaked = staked

      this.ebakusWalletStakedChanged(staked)
    },

    ebakusWalletOnResetConnection: noop,
    ebakusWalletResetConnection: function() {
      this._isWalletConnected = false

      this.ebakusWalletOnResetConnection()
    },

    ebakusWalletCheckConnectionError: async function(err) {
      const self = this
      return await checkConnectionError(err, {
        getProviderEndpoint: async () => {
          if (this.isEbakusWalletAllowed) {
            const endpoint = await ebakusWallet.getCurrentProviderEndpoint()

            if (endpoint) return endpoint
          }
          return process.env.WEB3JS_NODE_ENDPOINT
        },
        preInit: async () => {
          self.ebakusWalletResetConnection()
        },
        postInit: async () => {
          self.walletError = ''
          self.ebakusWalletConnect()
        },
      })
    },

    ebakusWalletCheckRouteAllowed: function() {
      return true
    },

    ebakusWalletOnConnectSuccess: asyncNoop,

    ebakusWalletOnConnectFailure: asyncNoop,

    ebakusWalletConnect: debounce(async function() {
      if (this._web3Connecting || !this.ebakusWalletCheckRouteAllowed()) {
        return
      }

      this._web3Connecting = true
      try {
        if (this.isEbakusWalletAllowed) {
          const endpoint = await ebakusWallet.getCurrentProviderEndpoint()

          if (endpoint !== this._web3Endpoint) {
            this._web3Endpoint = endpoint
            setProvider(this._web3Endpoint)

            resetSystemContract()
            resetEnsContract()

            this.walletError = ''
          }
        }

        await this.ebakusWalletOnConnectSuccess()

        this._isWalletConnected = true
        this._web3Connecting = false
      } catch (err) {
        if (!(await this.ebakusWalletCheckConnectionError(err))) {
          console.error('Failed to retrieve provider endpoint from wallet', err)

          this._web3Connecting = false

          this.walletError = 'Failed to connect, retrying...'

          this.ebakusWalletResetConnection()
        }

        await this.ebakusWalletOnConnectFailure()
      }
    }, DEBOUNCE_DELAY),

    ebakusWalletFetchAccount: async function() {
      if (!this.isEbakusWalletAllowed)
        throw new Error('Please allow cookies for Ebakus wallet first.')

      try {
        this.walletAddress = await ebakusWallet.getAccount()
        return this.walletAddress
      } catch (err) {
        if (!(await this.ebakusWalletCheckConnectionError(err))) {
          console.error('Failed to retrieve user address from wallet', err)
          ebakusWallet.unlockWallet()
        }
      }
    },
  },
}
