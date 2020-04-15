<template>
  <div v-if="!hasUserConsented" class="cookiePolicy">
    <p>
      This website stores data such as cookies to enable important site
      functionality including analytics and personalization. You may alter your
      preferences at any time or accept the default settings.
    </p>

    <ul>
      <li>
        <input
          id="analytics"
          v-model="analytics"
          class="tgl tglLight"
          type="checkbox"
        />
        <label class="tglBtn" for="analytics" data-label="Analytics"></label>
      </li>
      <li>
        <input
          id="ebakusWallet"
          v-model="ebakusWallet"
          class="tgl tglLight"
          type="checkbox"
        />
        <label
          class="tglBtn"
          for="ebakusWallet"
          data-label="Ebakus Wallet"
        ></label>
      </li>
    </ul>

    <button @click="save">Save</button>
    <button @click="acceptAll">Accept All</button>
  </div>
</template>

<script>
import { bootstrap as gTagBootstap } from 'vue-gtag'
import { store, mutations } from '@/store'

export default {
  data() {
    return {
      analytics: store.analyticsAllowed,
      ebakusWallet: store.hasUserConsented ? store.ebakusWalletAllowed : true,
    }
  },
  computed: {
    hasUserConsented: () => store.hasUserConsented,
  },
  created() {
    this.handleAnalytics()
  },
  methods: {
    save: function() {
      mutations.setAllowEbakusWallet(this.ebakusWallet)
      mutations.setAllowAnalytics(this.analytics)
      this.handleAnalytics()
    },
    acceptAll: function() {
      mutations.setAllowEbakusWallet(true)
      mutations.setAllowAnalytics(true)
      this.handleAnalytics()
    },
    handleAnalytics: function() {
      if (!this.analytics) return
      if (
        process.env.NODE_ENV === 'production' &&
        process.env.GOOGLE_TRACKING_ID
      ) {
        gTagBootstap()
      }
    },
  },
}
</script>

<style scoped lang="scss">
.cookiePolicy {
  position: fixed;
  left: 18px;
  bottom: 18px;
  width: 280px;
  padding: 30px;
  border-radius: 5px;
  box-shadow: 0 2px 34px 0 rgba(0, 0, 0, 0.1);
  background-color: #ffffff;

  text-align: left;

  opacity: 0;
  animation: fadeIn 0.4s ease 2s forwards;

  ul {
    list-style: none;
    margin: 35px auto;
    padding-left: 0;
  }

  li {
    padding-bottom: 8px;
  }
}

.tgl {
  display: none;

  // add default box-sizing for this scope
  &,
  &:after,
  &:before,
  & *,
  & *:after,
  & *:before,
  & + .tglBtn {
    box-sizing: border-box;
    &::selection {
      background: none;
    }
  }

  + .tglBtn {
    outline: 0;
    display: block;
    width: 40px;
    height: 20px;
    position: relative;
    cursor: pointer;
    user-select: none;
    &:after,
    &:before {
      position: relative;
      display: block;
      content: '';
      width: 50%;
      height: 100%;
    }

    &:before {
      left: 0;
    }

    &:after {
      content: attr(data-label);
      position: absolute;
      left: 50px;
      top: 0;
      font-weight: bold;
      white-space: nowrap;
    }
  }

  &:checked + .tglBtn:before {
    left: 50%;
  }
}

// themes
.tglLight {
  + .tglBtn {
    background: #f0f0f0;
    border-radius: 2em;
    padding: 2px;
    transition: all 0.4s ease;
    &:before {
      border-radius: 50%;
      background: #fff;
      transition: all 0.2s ease;
    }
  }

  &:checked + .tglBtn {
    background: #66eec7;
  }
}

button {
  width: 49%;
  height: 45px;
  border-radius: 4px;
  border: solid 1px #acb4c9;
  background-color: #f8f9fb;
  font-size: 16px;
  font-weight: bold;
  color: #112f42;

  &:last-child {
    margin-left: 2%;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
