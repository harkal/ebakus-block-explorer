<template>
  <div id="tabbar" :class="{ active: tabbarActive }">
    <div class="horizontal-scroll">
      <ul id="tabbarOptions">
        <li
          :id="RouteNames.BLOCKS"
          :class="{ active: $route.name === RouteNames.BLOCKS }"
          @click="toggleTab(RouteNames.BLOCKS)"
        >
          <img src="@/assets/img/ic_blocks.png" alt /> Blocks
        </li>
        <li
          :id="RouteNames.TRANSACTIONS"
          :class="{ active: $route.name === RouteNames.TRANSACTIONS }"
          @click="toggleTab(RouteNames.TRANSACTIONS)"
        >
          <img src="@/assets/img/ic_transactions.png" alt />
          <span class="txsButton"></span>
        </li>
        <!-- <li class="mobileOnly"></li> -->
        <li
          :id="RouteNames.PRODUCERS"
          :class="{ active: $route.name === RouteNames.PRODUCERS }"
          @click="toggleTab(RouteNames.PRODUCERS)"
        >
          <img src="@/assets/img/ic_stats.png" alt /> Producers
        </li>
      </ul>
    </div>

    <div class="container">
      <router-view name="tabbar"></router-view>
    </div>
  </div>
</template>

<script>
import router, { RouteNames } from '@/router'
import { store, mutations } from '@/store'

import Blocks from '@/components/Blocks'
import Producers from '@/components/Producers'

export const TabNames = {
  BLOCKS: 'blocks',
  TRANSACTIONS: 'transactions',
  PRODUCERS: 'producers',
}

export default {
  // components: { Blocks, Producers },
  props: {
    tabbarActive: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    TabNames: () => TabNames,
    RouteNames: () => RouteNames,
    isContentActive: () => store.contentActive,
  },
  watch: {
    $route(to, from) {
      if (to.name !== from.name && this.$isTabbarNavigation(to.name))
        mutations.setContentActive(true)
    },
  },
  created: function() {
    mutations.setContentActive(this.$isTabbarNavigation())
  },
  methods: {
    toggleTab: function(routeName) {
      if (this.isContentActive) {
        if (this.$isTabbarNavigation() && this.$route.name !== routeName) {
          this.$router.replace(
            {
              name: routeName,
            },
            () => {}
          )
        } else {
          this.$router.go(-1)
          mutations.setContentActive(false)
          setTimeout(() => {
            if (this.$isTabbarNavigation()) {
              this.$router.replace(
                {
                  name: RouteNames.HOME,
                },
                () => {}
              )
            }
          }, 0)
        }
      } else {
        this.$router.push(
          {
            name: routeName,
          },
          () => {}
        )
        mutations.setContentActive(true)
      }
    },
  },
}
</script>

<style scoped lang="scss">
@import '../assets/css/variables';

#tabbar {
  position: fixed;
  left: 0px;
  right: 0px;
  bottom: 0px;
  height: 76px;

  background: #fff;
  box-shadow: 0 2px 43px 0 rgba(172, 180, 201, 0.4);

  transition: 0.35s height ease-in-out;

  &.active {
    height: calc(100% - 190px);
  }

  @media (max-width: $mobile-grid-breakpoint) {
    .horizontal-scroll {
      overflow-x: auto;
    }
  }

  @media (max-width: $mobile-grid-breakpoint) {
    height: 60px;

    &.active {
      height: calc(100% - 205px);
    }
  }

  // @media (max-width: 350px) {
  //   height: 102px;
  // }
}

#tabbarOptions {
  width: 584px;
  margin: 15px auto;
  padding-left: 0;

  li {
    display: inline-block;

    margin: 4px;
    padding: 8px 18px;

    color: #34393d;

    border: 2px solid #acb4c9;
    border-radius: 4px;

    background: #f8f9fb;

    font-weight: 600;

    user-select: none;

    &:hover {
      box-shadow: 0 2px 43px 0 rgba(0, 0, 0, 0.1);
    }

    img {
      width: 14px;
      vertical-align: -1px;
    }

    &.active {
      color: white;
      background: #34393d;
      border: 2px solid #34393d;

      img {
        filter: invert(100%) grayscale(100%);
      }
    }

    // &.mobileOnly {
    //   display: none;

    //   @media (max-width: 350px) {
    //     display: block;
    //     height: 0;
    //     margin: 0;
    //     padding: 0;
    //     background-color: transparent;
    //     border: transparent;
    //   }
    // }
  }

  @media (max-width: $mobile-grid-breakpoint) {
    width: 100%;
    max-width: 352px;

    margin: 12px auto;
    padding: 0px;
    white-space: normal;

    li {
      padding: 5px 7px;
      font-size: 14px;
    }

    img {
      width: 12px;
    }
  }
}

.txsButton:after {
  content: 'Transactions';
  padding-left: 2px;

  @media (max-width: $mobile-grid-breakpoint) {
    content: 'Txs';
  }
}
</style>
