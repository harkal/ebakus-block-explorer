<template>
  <div>
    <div id="search-wrapper">
      <input
        ref="searchField"
        v-model="searchInput"
        type="text"
        placeholder="Search by txid, block number, address or ENS name"
        @keyup.enter="searchWithQuery('searchBtn')"
      />
      <button
        id="searchBtn"
        ref="submitSearch"
        @click="searchWithQuery('searchBtn')"
      >
        <span>Go</span>
      </button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import { store, mutations } from '@/store'

import Address from '@/components/Address'
import Block from '@/components/Block'
import Transaction from '@/components/Transaction'
import { getAddressForEns, storeEnsNameForAddress } from '@/utils/ens'
import { RouteNames } from '../router'

export default {
  data() {
    return {
      searchInput: store.searchQuery,
      error: '',
    }
  },
  computed: {
    searchQuery: () => store.searchQuery,
  },
  watch: {
    searchQuery: function(val, oldVal) {
      if (val !== oldVal) {
        this.searchInput = val
      }
    },
    searchInput: function() {
      this.error = ''
    },
  },
  methods: {
    searchWithQuery: async function(e) {
      const query = this.searchInput.replace(/ /g, '')

      // the router handler for SEARCH routes to correct router
      this.$router.push(
        {
          name: RouteNames.SEARCH,
          params: { query },
        },
        success => {
          mutations.setQuery(query)
        },
        err => {
          if (typeof err !== 'undefined') {
            this.error =
              'Please enter a txid, a block number, an account address or an ENS name.'
          }
        }
      )
    },
  },
}
</script>

<style scoped lang="scss">
@import '../assets/css/variables';

#search-wrapper {
  position: relative;
  display: block;
  margin-top: 12px;
}

input[type='text'] {
  width: calc(100% - 50px - #{$spacer-2});
  height: 48px;

  padding-left: 50px;
  padding-right: $spacer-2;

  background: url('../assets/img/ic_search.png') no-repeat #ffffff;
  background-size: 20px;
  background-position: 15px 18px;

  border-radius: 4px;

  font-size: 18px;
  text-align: center;

  transition: 0.5s all ease;

  &:focus {
    border-color: rgba(17, 47, 66, 0.15);
    box-shadow: inherit;
  }

  @media (max-width: 960px) {
    width: calc(100% - 36px - #{$spacer-2});
    height: 40px;

    padding-left: 36px;

    text-align: left;
    text-overflow: ellipsis;
    font-size: 16px;
    background-size: 15px;
    background-position: 12px 14px;
  }
}

input:focus,
button:focus {
  outline: none;
  opacity: 1;
  transform: scale(1);
}

input:focus + button {
  opacity: 1;
  transform: scale(1);
}

button {
  position: absolute;
  top: 5px;
  right: 4px;
  width: 54px;
  height: 42px;

  background: #fe4184;
  color: white;

  border: 0;
  border-radius: 4px;

  font-size: 20px;
  font-weight: 700;

  opacity: 0;

  transition: 0.5s all ease;
  transform: scale(0.9);

  &:active {
    transform: scale(0.9);
  }

  @media (max-width: 960px) {
    top: 0;
    right: -2px;

    height: 44px;

    font-size: 16px;
    font-weight: 700;

    border-radius: 0 4px 4px 0;
    box-shadow: -6px 0px 2px 0px white;
  }
}

.error {
  margin-bottom: 0;
  text-align: left;
  color: #fe4184;
  transition: 0.5s opacity ease;

  &.hide {
    opacity: 0;
  }
}
</style>
