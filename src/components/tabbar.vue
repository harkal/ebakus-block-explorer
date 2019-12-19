<template>
  <div id="tabbar" :class="{ active: tabbarActive }">
    <div class="scroll">
      <ul id="tabbarOptions">
        <li
          :id="RouteNames.BLOCKS"
          :class="{ active: $route.name === RouteNames.BLOCKS }"
          @click="toggleTab(RouteNames.BLOCKS)"
        >
          <img src="../assets/ic_blocks.png" alt /> Blocks
        </li>
        <li
          :id="RouteNames.TRANSACTIONS"
          :class="{ active: $route.name === RouteNames.TRANSACTIONS }"
          @click="toggleTab(RouteNames.TRANSACTIONS)"
        >
          <img src="../assets/ic_transactions.png" alt /> Transactions
        </li>
        <li
          :id="RouteNames.STATISTICS"
          :class="{ active: $route.name === RouteNames.STATISTICS }"
          @click="toggleTab(RouteNames.STATISTICS)"
        >
          <img src="../assets/ic_stats.png" alt /> Statistics
        </li>
      </ul>
    </div>

    <div class="container">
      <Blocks :class="{ active: $route.name == RouteNames.BLOCKS }" />
      <Transactions
        :class="{ active: $route.name == RouteNames.TRANSACTIONS }"
      />
      <Statistics :class="{ active: $route.name == RouteNames.STATISTICS }" />
    </div>
  </div>
</template>

<script>
import router, { RouteNames } from '@/router'
import { store, mutations } from '@/store'

import Blocks from '@/components/Blocks'
// import Transactions from '@/components/transactions'
import Statistics from '@/components/Statistics'

export const TabNames = {
  BLOCKS: 'blocks',
  TRANSACTIONS: 'transactions',
  STATISTICS: 'statistics',
}

export default {
  components: { Blocks, Statistics },
  props: {
    tabbarActive: {
      type: Boolean,
      default: false,
    },
    selectedByRoute: {
      type: String,
      default: '',
    },
    searchQuery: {
      type: String,
      default: '',
    },
  },

  computed: {
    TabNames: () => TabNames,
    RouteNames: () => RouteNames,
    isContentActive: () => store.contentActive,

    isTabbarNavigation: function() {
      return [
        RouteNames.BLOCKS,
        RouteNames.TRANSACTIONS,
        RouteNames.STATISTICS,
      ].includes(router.app.$route.name)
    },
  },
  created: function() {
    mutations.setContentActive(this.isTabbarNavigation)
  },
  methods: {
    toggleTab: function(routeName) {
      if (this.isContentActive) {
        if (this.isTabbarNavigation && this.$route.name !== routeName) {
          this.$router.replace(
            {
              name: routeName,
            },
            () => {}
          )
        } else {
          this.$router.go(-1)
          mutations.setContentActive(false)
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#tabbar {
  position: fixed;
  background: #fff;
  left: 0px;
  right: 0px;
  bottom: 0px;
  height: 76px;
  /* Rectangle 3: */

  transition: 0.35s height ease-in-out;
  /* Rectangle 3: */

  box-shadow: 0 2px 43px 0 rgba(172, 180, 201, 0.4);
}

#tabbarOptions {
  width: 460px;
  margin: 15px auto;
}
li {
  display: inline-block;
  /* Rectangle 2: */

  border-radius: 4px;

  border: 2px solid #acb4c9;
  color: #34393d;
  padding: 8px 18px;
  margin: 0px 10px;
  background: #f8f9fb;
  font-weight: 600;
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome and Opera */
}
li.active {
  background: #34393d;
  color: white;
  border: 2px solid #34393d;
}
li:hover {
  box-shadow: 0 2px 43px 0 rgba(0, 0, 0, 0.1);
}
li img {
  width: 14px;
  vertical-align: -1px;
}
li.active img {
  filter: invert(100%) grayscale(100%);
}
#tabbar.active {
  height: calc(100% - 215px);
}
#tabContentWrapper {
  height: 100%;

  overflow: auto;
}
.container {
  margin: 0 auto;
}
ul.tabbarOptions li.img {
  -webkit-user-select: none; /* Chrome all / Safari all */
  -moz-user-select: none; /* Firefox all */
  -ms-user-select: none; /* IE 10+ */
  user-select: none;
  cursor: pointer;
}

@media (max-width: 560px) {
  .scroll {
    overflow-x: auto;
  }
  ul#tabbarOptions {
    width: 330px;

    margin: 12px auto;
    padding: 0px;
  }
  #tabbarOptions li {
    padding: 5px 8px;
    margin: 0px 4px;
    font-size: 14px;
  }
  #tabbarOptions img {
    width: 12px;
  }
  #tabbar {
    height: 60px;
  }
  #tabbar.active {
    height: calc(100% - 100px);
  }
}
</style>
