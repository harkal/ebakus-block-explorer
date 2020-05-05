<template>
  <div id="producers-wrapper" class="tab-wrapper">
    <small>
      There are
      <strong>{{ witnesses.length >= 21 ? 21 : witnesses.length }}</strong>
      block producers elected from
      <strong>{{ witnesses.length }}</strong> witnesses.
    </small>

    <ul class="tab-results labels">
      <li class="list-title">
        <span class="col id">#</span>
        <span class="col address producer">
          <input
            ref="filterField"
            v-model="filterAddressQuery"
            type="text"
            placeholder="Address"
            @keyup="filterByAddress()"
          />
        </span>
        <span class="col amount">Stake</span>
        <span class="col vote"></span>
      </li>
    </ul>
    <div class="scroll inner">
      <ul class="tab-results main">
        <li
          v-for="(witness, idx) in displayedWitnesses"
          :key="`${witness.Id}-${idx}`"
          :class="{ changed: isChanged(witness.Id) }"
        >
          <span class="mobileLabel">#</span>
          <span class="col id">{{ idx + 1 }}</span>
          <span class="mobileLabel">Address</span>
          <span class="col address producer">
            <router-link
              :to="{ path: '/search/' + witness.Id }"
              :title="witness.Id"
              >{{ witness | toENS('Id') }}</router-link
            >
          </span>
          <span class="mobileLabel">Stake</span>
          <span class="col amount">
            {{ (witness.Stake / 10000).toFixed(4) }}
            <small> EBK</small>
          </span>
          <span class="mobileLabel">Vote</span>
          <span class="col vote">
            <button
              v-if="!isMyVotesLoading && isMyVotesLoaded && walletAddress"
              @click="toggleVote(witness.Id)"
            >
              {{ isVoted(witness.Id) ? 'Unvote' : 'Vote' }}
            </button>
          </span>
        </li>
        <li
          v-for="index in displayedWitnesses.length == 0 || isWitnessesLoading
            ? 3
            : 0"
          :key="index"
          class="placeholder"
        >
          <span class="mobileLabel">#</span>
          <span class="col id">
            <ContentLoader :width="14" />
          </span>
          <span class="mobileLabel">Address</span>
          <span class="col address producer">
            <ContentLoader :width="400" />
          </span>
          <span class="mobileLabel">Stake</span>
          <span class="col amount">
            <ContentLoader :width="60" />
            <small> EBK</small>
          </span>
          <span class="mobileLabel">Vote</span>
          <span class="col vote">
            <ContentLoader :width="50" :height="22" />
          </span>
        </li>
        <li
          v-if="
            filterAddressQuery !== '' &&
              isWitnessesLoaded &&
              displayedWitnesses.length === 0
          "
        >
          No witness found!
        </li>
      </ul>
    </div>

    <div class="actions-area">
      <span v-if="isEbakusWalletAllowed && isMyVotesLoaded"
        >You have used {{ newVoting.length }} out of {{ MaxVotes }} votes.</span
      >
      <span
        v-else-if="hasUserConsented && !isEbakusWalletAllowed"
        class="txt-warning"
      >
        In order to vote, you have to allow ebakus wallet to store browser
        cookies.
        <button class="allowCookies" @click="allowEbakusWallet">Allow</button>
      </span>

      <span v-if="hasReachedMaxVotes && error === ''" class="txt-danger"
        >Maximum number of votes reached.</span
      >

      <span v-if="error !== ''" class="txt-danger">{{ error }}</span>

      <span v-if="walletError !== ''" class="txt-danger">{{
        walletError
      }}</span>

      <button v-if="hasChangedVotes" @click="submitVotes()">
        Submit changes
      </button>
    </div>
  </div>
</template>

<script>
import ebakusWallet from 'ebakus-web-wallet-loader'
import { debounce } from 'lodash'

import { RouteNames } from '@/router'
import { web3, setProvider, checkConnectionError } from '@/utils/web3ebakus'
import { getEnsNameForAddress, resetEnsContract } from '@/utils/ens'
import {
  SystemContractAddress,
  resetSystemContract,
  getSystemContract,
} from '@/utils/systemContract'
import { store, mutations } from '@/store'

import SharedWalletMixin from '@/mixins/SharedWalletMixin'

import ContentLoader from './ContentLoader'

const MAX_VOTES = 20

export default {
  components: {
    ContentLoader,
  },
  mixins: [SharedWalletMixin],
  data() {
    return {
      witnesses: [],
      displayedWitnesses: [],
      currentlyVoted: [],
      newVoting: [],
      filterAddressQuery: '',
      showTitle: false,

      systemContractInstance: null,

      isWitnessesLoaded: false,
      isWitnessesLoading: false,
      isMyVotesLoading: false,
      isMyVotesLoaded: false,
      error: '',
    }
  },
  computed: {
    MaxVotes: () => MAX_VOTES,
    hasUserConsented: () => store.hasUserConsented,
    hasChangedVotes: function() {
      return (
        !this.newVoting.every(address =>
          this.currentlyVoted.includes(address)
        ) ||
        !this.currentlyVoted.every(address => this.newVoting.includes(address))
      )
    },
    hasReachedMaxVotes: function() {
      return this.newVoting.length >= MAX_VOTES
    },
  },
  // watch: {
  //   $route: async function(to, from) {
  //     if (to.name !== from.name && to.name === RouteNames.PRODUCERS) {
  //       if (this.systemContractInstance !== null) {
  //         try {
  //           await web3.eth.net.getId()
  //           await this.fetchAccount()
  //           this.loadWitnesses()
  //           this.loadCurrentlyVoted()
  //         } catch (err) {
  //           if (!(await this.ebakusWalletCheckConnectionError(err))) {
  //             this.ebakusWalletConnect()
  //           }
  //         }
  //       } else {
  //         this.ebakusWalletConnect()
  //       }
  //     }
  //   },
  // },
  methods: {
    /* Start Ebakus wallet mixin overrides */
    ebakusWalletCurrentProviderEndpointChanged: function(endpoint) {
      this.displayedWitnesses = []
    },

    ebakusWalletAccountChanged: function(address) {
      this.ebakusWalletOnConnectSuccess()
    },

    ebakusWalletStakedChanged: function(staked) {
      if (!web3) {
        return
      }

      this.loadWitnesses()
      this.loadCurrentlyVoted()
    },

    ebakusWalletOnResetConnection: function() {
      resetSystemContract()
      resetEnsContract()

      this.systemContractInstance = null
    },

    ebakusWalletCheckRouteAllowed: function() {
      return this.$route.name === RouteNames.PRODUCERS
    },

    ebakusWalletOnConnectSuccess: async function() {
      await this.fetchAccount()
      this.systemContractInstance = await getSystemContract()

      this.loadWitnesses()
      this.loadCurrentlyVoted()
    },
    /* End Ebakus wallet mixin overrides */

    fetchAccount: async function() {
      await this.ebakusWalletFetchAccount()
      this.loadCurrentlyVoted()
    },

    loadWitnesses: async function() {
      if (this.isWitnessesLoading || this.systemContractInstance === null)
        return

      try {
        this.isWitnessesLoading = true
        this.witnesses = []
        this.displayedWitnesses = []
        const iter = await web3.db.select(
          SystemContractAddress,
          'Witnesses',
          'Flags == 1',
          'Stake DESC',
          'latest'
        )

        let witness = null

        do {
          witness = await web3.db.next(iter)
          if (witness != null) {
            witness.IdEns = await getEnsNameForAddress(witness.Id)

            this.witnesses.push(witness)
            this.displayedWitnesses.push(witness)

            if (this.filterAddressQuery !== '') {
              this.filterByAddress()
            }
          }
        } while (witness != null)

        this.isWitnessesLoaded = true
        this.showTitle = true
      } catch (err) {
        this.isWitnessesLoaded = false
        this.showTitle = false

        if (!(await this.ebakusWalletCheckConnectionError(err))) {
          console.error('Failed to fetch witnesses', err)
        }
      }

      this.isWitnessesLoading = false
    },

    loadCurrentlyVoted: async function() {
      if (
        this.isMyVotesLoading ||
        this.systemContractInstance === null ||
        !this.isEbakusWalletAllowed
      )
        return

      this.isMyVotesLoading = true

      this.currentlyVoted = []
      this.newVoting = []

      try {
        const iter = await web3.db.select(
          SystemContractAddress,
          'Delegations',
          'Id LIKE ' + this.walletAddress,
          '',
          'latest'
        )

        let delegation = null

        do {
          delegation = await web3.db.next(iter)
          if (delegation != null) {
            const to = web3.utils.bytesToHex(delegation.Id.slice(20))
            this.currentlyVoted.push(to)
            this.newVoting.push(to)
          }
        } while (delegation != null)

        this.isMyVotesLoaded = true
      } catch (err) {
        this.isMyVotesLoaded = false

        if (!(await this.ebakusWalletCheckConnectionError(err))) {
          console.error('Failed to fetch voted witnesses', err)
        }
      }

      this.isMyVotesLoading = false
    },

    isVoted: function(address) {
      return this.newVoting.includes(address)
    },
    isCurrentlyVoted: function(address) {
      return this.currentlyVoted.includes(address)
    },
    isChanged: function(address) {
      return (
        this.currentlyVoted.includes(address) !==
        this.newVoting.includes(address)
      )
    },
    toggleVote: function(address) {
      if (this.newVoting.includes(address)) {
        this.newVoting = this.newVoting.filter(i => i !== address)
      } else {
        if (this.hasReachedMaxVotes) {
          return
        }

        this.newVoting.push(address)
      }
    },
    submitVotes: async function() {
      if (this.systemContractInstance === null) {
        this.error = 'Please check that wallet is connected.'
        return
      }

      this.error = null

      try {
        let cmd,
          isVoting = this.newVoting.length > 0
        if (isVoting) {
          cmd = this.systemContractInstance.methods.vote(this.newVoting)
        } else {
          cmd = this.systemContractInstance.methods.unvote()
        }

        const tx = {
          to: SystemContractAddress,
          data: cmd.encodeABI(),
        }

        const staked = await ebakusWallet.getStaked()
        if (staked > 0) {
          const estimatedGas = await cmd.estimateGas({
            from: this.walletAddress,
          })
          tx.gas = estimatedGas + 10000
        }

        const res = await ebakusWallet.sendTransaction(tx)
        if (res && res.status) {
          this.loadWitnesses()
          this.loadCurrentlyVoted()
        }
      } catch (err) {
        console.error('Voting failed', err)
        this.error = 'Something went wrong. Please try again.'

        await this.ebakusWalletCheckConnectionError(err)
      }
    },
    filterByAddress: function() {
      const filterAddressQuery = this.filterAddressQuery

      if (filterAddressQuery == '') {
        this.displayedWitnesses = this.witnesses
        return
      }

      this.displayedWitnesses = this.witnesses.filter(w =>
        w.Id.startsWith(filterAddressQuery)
      )
    },
  },
}
</script>

<style scoped lang="scss">
@import '../assets/css/variables';
#tabbar.active .scroll.inner {
  height: calc(100% - 227px) !important;

  @media (max-width: $mobile-grid-breakpoint) {
    height: calc(100% - 121px) !important;
    overflow-x: hidden !important;
  }
}

.actions-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  min-height: 22px;
  padding: 24px;
  border-top: 1px solid #c6c6c6;
  background-color: #fff;

  opacity: 0;
  animation: fadeIn 0.3s ease-in forwards;

  span {
    float: left;
  }

  .danger {
    margin-left: 4px;
  }

  button {
    float: right;
    display: block;
    padding: 12px 18px;
    margin: -10px 0;
    border-radius: 10px;
    color: white;
    background: #fe4184;
    font-size: 16px;
    font-weight: 700;
    transition: 0.5s all ease;
    transform: scale(1);
    border: 0;
    cursor: pointer;
    outline: none;
  }

  .allowCookies {
    margin-left: 12px;
    border-radius: 4px;
    border: solid 1px #acb4c9;
    background-color: #f8f9fb;
    color: #112f42;
  }

  @media (max-width: $mobile-grid-breakpoint) {
    padding: 8px;
    text-align: center;

    span {
      float: none;
      font-size: 14px;
    }

    button {
      float: none;
      margin: 6px auto 0;
      padding: 8px 14px;
      font-size: 14px;
    }
  }

  @media (max-width: 670px) {
    .allowCookies {
      display: block;
      float: none;
      margin: 12px auto 0;
    }
  }
}

.main li {
  animation: fadeIn 0.2s ease-in;

  &.changed {
    background-color: #e6ffeb !important;

    @media (max-width: $mobile-grid-breakpoint) {
      .mobileLabel {
        background-color: #e6ffeb;
      }
    }
  }

  button {
    min-width: 70px;
    font-size: 12px;

    @media (max-width: $mobile-grid-breakpoint) {
      min-width: 70px;
      padding: 4px 8px;
      font-size: 10px;
    }
  }
}

.labels .producer {
  text-align: left;

  input {
    width: 100%;
    padding-top: 4px;
    padding-bottom: 4px;
    box-sizing: border-box;
    font-size: 14px;
    font-weight: 400;
    color: #828383 !important;
    opacity: 0.8;
  }
}

.main .amount {
  text-align: right;

  @media (max-width: $mobile-grid-breakpoint) {
    text-align: left;
  }
}

.producer {
  text-align: left;
}

.vote {
  max-width: 90px;

  button {
    font-weight: 700;
  }
}
</style>
