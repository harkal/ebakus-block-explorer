import Vue from 'vue'

export const store = Vue.observable({
  contentActive: false,
  searchQuery: '',
  blockHeight: '',
})

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
}
