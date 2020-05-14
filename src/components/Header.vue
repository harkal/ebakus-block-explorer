<template>
  <div id="topbar">
    <img
      src="@/assets/img/explorer-logo.svg"
      alt="Ebakus Block Explorer"
      class="logo"
      @click="$router.push({ name: RouteNames.HOME }).catch(() => {})"
    />

    <nav>
      <input v-model="menuToggle" type="checkbox" class="toggle" />

      <span class="hamburger"></span>
      <span class="hamburger"></span>

      <span class="text"></span>

      <ul>
        <li>
          <router-link :to="{ name: RouteNames.HOME }" title="Home" exact>
            <img src="@/assets/img/ic-home.svg" alt /> Home
          </router-link>
          <ul>
            <!-- <li>
              <router-link
                :to="{ name: RouteNames.HOME, hash: '#stats' }"
                title="Statistics"
                exact
              >
                <img src="@/assets/img/ic-stats-small.svg" alt /> Statistics
              </router-link>
            </li> -->
            <li>
              <router-link
                :to="{ name: RouteNames.HOME, hash: '#ens' }"
                title="Name Service"
                exact
              >
                <img src="@/assets/img/ic-ens-small.svg" alt /> Name Service
              </router-link>
            </li>
          </ul>
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
  data() {
    return { menuToggle: false }
  },
  computed: { RouteNames: () => RouteNames },
  watch: {
    $route(to, from) {
      if (to.fullPath !== from.fullPath) {
        this.menuToggle = false
      }
    },
  },
}
</script>

<style scoped lang="scss">
@import '../assets/css/variables';

#topbar {
  position: relative;

  &:after {
    content: '';
    display: table;
    clear: both;
  }
}

.logo {
  float: left;
  height: 34px;
  object-fit: contain;

  @media (max-width: $mobile-navigation-breakpoint) {
    display: none;
  }
}

nav {
  position: relative;
  float: left;
  width: 200px;
  margin-top: 7px;
  margin-left: 40px;
  text-align: left;

  .text {
    display: none;

    &:after {
      content: 'explorer';
      transition: all 0.3s ease;
    }

    @media (max-width: $mobile-navigation-breakpoint) {
      position: absolute;
      display: block;
      top: -9px;
      left: 38px;
      margin: 0;

      color: #112f42;

      font-size: 20px;
      font-weight: 500;
    }
  }

  .toggle {
    display: none;
    width: 150px;
    height: 7px + ($spacer-3 * 2);
    position: absolute;
    top: -$spacer-3;
    left: -$spacer-3;

    cursor: pointer;

    opacity: 0; /* hide this */
    z-index: 2; /* and place it over the hamburger */

    -webkit-touch-callout: none;

    &:checked {
      // Transform all the slices of hamburger into a crossmark
      & ~ .hamburger {
        opacity: 1;
        transform: rotate(45deg) translate(-2px, -2px);
        background: #232323;
      }

      // Last one should go the other direction
      & ~ .hamburger:nth-last-child(3) {
        transform: rotate(-45deg) translate(0, -2px);
      }

      & ~ .text:after {
        content: 'menu';
      }
    }

    @media (max-width: $mobile-navigation-breakpoint) {
      display: block;
    }
  }

  .hamburger {
    display: none;

    @media (max-width: $mobile-navigation-breakpoint) {
      display: block;
      width: 22px;
      height: 2px;
      margin-bottom: 7px;
      position: relative;

      background: #000000;
      border-radius: 3px;

      z-index: 1;

      transform-origin: 4px 0px;

      transition: transform 0.5s cubic-bezier(0.77, 0.2, 0.05, 1),
        background 0.5s cubic-bezier(0.77, 0.2, 0.05, 1), opacity 0.55s ease;

      &:first-child {
        transform-origin: 0% 0%;
      }

      &:nth-last-child(2) {
        transform-origin: 0% 100%;
      }
    }
  }

  & > ul {
    position: relative;
    margin: 0;
    padding: 0;

    list-style: none;

    li {
      position: relative;
      display: inline-block;
      margin-right: $spacer-3;
      padding-bottom: 3px;

      &:hover {
        ul {
          top: 28px;
          opacity: 1;
        }
      }

      &:last-child {
        margin-right: 0;
      }

      a {
        color: #112f42;

        font-size: 18px;
        font-weight: 700;

        opacity: 0.5;
        transition: opacity 0.3s ease;

        &:hover,
        &.active {
          opacity: 1;
        }
      }

      img {
        width: 24px;
        vertical-align: -5px;
        object-fit: contain;
      }
    }

    ul {
      position: absolute;
      top: -600px;
      left: -12px;
      padding: $spacer-3 0;
      min-width: 160px;

      background: #fff;
      box-shadow: 0 2px 24px 0 #dbe1eb;

      z-index: 10;

      opacity: 0;
      transition: opacity 0.15s ease;

      li {
        display: block;
        padding: $spacer-2 $spacer-3;
        width: 100%;

        text-align: left;

        a {
          font-size: 16px;
          font-weight: 400;
        }
      }

      img {
        width: 20px;
      }
    }
  }

  @media (max-width: $mobile-navigation-breakpoint) {
    float: none;
    top: 0;
    left: 0;
    margin-top: 0;
    margin-left: 0;

    z-index: 1;

    -webkit-user-select: none;
    user-select: none;

    & > ul {
      position: absolute;
      top: 28px;
      width: 220px;
      height: 100vh;
      margin: 0 0 0 (-$spacer-3);
      padding: 0 $spacer-3;

      background: #fff;
      list-style-type: none;
      -webkit-font-smoothing: antialiased;
      /* to stop flickering of text in safari */

      box-shadow: 0 2px 24px 0 #dbe1eb;

      transform-origin: 0% 0%;
      transform: translate(-100%, 0);
      opacity: 0;

      transition: transform 0.5s cubic-bezier(0.77, 0.2, 0.05, 1);

      li {
        display: block;
        padding: $spacer-2 0;

        text-align: left;
        font-size: 22px;
      }

      ul {
        position: initial;

        margin-top: $spacer-3;
        margin-left: 11px;
        padding: 0 0 0 22px;
        border-left: 2px solid rgba(151, 151, 151, 0.14);

        box-shadow: none;

        opacity: 1;

        li {
          padding: 0;
        }
      }
    }

    // And let's slide it in from the left
    .toggle:checked ~ ul {
      transform: none;
      opacity: 1;
    }
  }
}
</style>
