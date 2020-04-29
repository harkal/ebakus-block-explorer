<template>
  <div id="topbar">
    <img
      src="@/assets/img/blockExplorer_logo_2.png"
      alt="Ebakus Block Explorer"
      class="logo"
      @click="$router.push('/')"
    />

    <nav>
      <ul>
        <li>
          <router-link :to="{ name: RouteNames.HOME }" title="Home" exact>
            <img src="@/assets/img/ic-home.svg" alt /> Home
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: RouteNames.RICHLIST }" title="Richlist">
            <img src="@/assets/img/ic-richlist.svg" alt /> Richlist
          </router-link>
        </li>
      </ul>
    </nav>
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

#topbar:after {
  content: '';
  display: table;
  clear: both;
}

.logo {
  float: left;
  height: 40px;
}

nav {
  float: right;
  margin-top: 10px;

  ul {
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      display: inline;
      margin-right: $spacer-3;

      &:last-child {
        margin-right: 0;
      }

      a {
        color: #112f42;

        font-size: 18px;
        font-weight: 600;

        opacity: 0.5;

        &:hover,
        &.active {
          opacity: 1;
        }
      }

      img {
        width: 24px;
        vertical-align: -4px;
        object-fit: contain;
      }
    }
  }

  @media (max-width: $mobile-grid-breakpoint) {
    float: left;
  }
}
</style>
