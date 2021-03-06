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
      ></button>
    </div>

    <p class="error" :class="{ hide: error === '' }">{{ error }}</p>
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
  props: {
    onUpdate: {
      type: Function,
      default: () => {},
    },
  },
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
  updated() {
    this.onUpdate()
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

$icon-size: 20px;
$margin-v: 5px;
$margin-h: 4px;

#search-wrapper {
  position: relative;
  display: block;
  margin-top: 12px;
}

input[type='text'] {
  width: calc(100% - #{$icon-size * 2 + 4px} - #{$spacer-2 * 2});
  height: 48px;

  padding-left: $spacer-2;
  padding-right: $spacer-2 + ($icon-size * 2 + 4px);

  border-radius: 4px;

  font-size: 18px;
  text-align: center;
  text-overflow: ellipsis;

  transition: 0.5s all ease;

  &:focus {
    border-color: rgba(17, 47, 66, 0.15);
    box-shadow: inherit;
  }

  @media (max-width: $tablet-grid-breakpoint) {
    height: 40px;

    text-overflow: ellipsis;
    font-size: 16px;
  }

  @media (max-width: $mobile-grid-breakpoint) {
    text-align: left;
  }
}

input:focus,
button:focus {
  outline: none;
  opacity: 1;
  transform: scale(1);
}

input:focus + button {
  background-color: #f8f9fb;
  border-color: #acb4c9;

  transform: scale(1);

  &:hover {
    background-color: #f0f3f7;
  }
}

button {
  position: absolute;
  top: 0;
  right: 0;
  width: $icon-size * 2;
  height: calc(100% - #{$margin-v * 2});

  margin: $margin-v $margin-h;

  background: url('../assets/img/ic_search.png') no-repeat transparent;
  background-size: $icon-size;
  background-position: 9px 10px;

  border: 1px solid transparent;
  border-radius: 4px;

  font-size: 20px;
  font-weight: 700;

  transition: 0.5s all ease;
  transform: scale(0.9);

  @media (max-width: $tablet-grid-breakpoint) {
    $icon-size: 16px;

    width: $icon-size * 2;

    background-size: $icon-size;
    background-position: ($icon-size / 2) ($icon-size / 2);

    font-size: 16px;
    font-weight: 700;
  }
}

.error {
  margin-bottom: 0;
  text-align: left;
  color: #fe4184;

  opacity: 1;
  transition: 0.5s opacity ease;

  &.hide {
    opacity: 0;
    transition: 0.5s opacity ease;
  }
}
</style>
