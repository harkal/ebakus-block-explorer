import Vue from 'vue'

const localStorageKey = 'userConsent'

let _hasUserConsented = false,
  _ebakusWalletAllowed = false,
  _analyticsAllowed = false

const userConsent = localStorage.getItem(localStorageKey)
if (userConsent) {
  try {
    const { analytics, ebakusWallet } = JSON.parse(userConsent)
    _hasUserConsented = true
    _analyticsAllowed = analytics
    _ebakusWalletAllowed = ebakusWallet
  } catch (err) {
    localStorage.removeItem(localStorageKey)
  }
}

export const store = Vue.observable({
  contentActive: false,
  searchQuery: '',
  blockHeight: '',
  usdRate: null,
  hasUserConsented: _hasUserConsented,
  ebakusWalletAllowed: _ebakusWalletAllowed,
  analyticsAllowed: _analyticsAllowed,
})

const saveInStorage = () => {
  localStorage.setItem(
    localStorageKey,
    JSON.stringify({
      analytics: store.analyticsAllowed,
      ebakusWallet: store.ebakusWalletAllowed,
    })
  )
}

export const mutations = {
  setContentActive(isActive) {
    store.contentActive = isActive
  },
  setQuery(query) {
    store.searchQuery = query
  },
  setBlockHeight(blockHeight) {
    store.blockHeight = blockHeight
  },
  setUsdRate(usdRate) {
    store.usdRate = usdRate
  },
  setAllowEbakusWallet(allowed) {
    store.ebakusWalletAllowed = allowed
    store.hasUserConsented = true
    saveInStorage()
  },
  setAllowAnalytics(allowed) {
    store.analyticsAllowed = allowed
    store.hasUserConsented = true
    saveInStorage()
  },
}
