<template>
  <div id="statistics_wrapper">
    <small>
      There are
      <strong>{{ witnesses.length >= 21 ? 21 : witnesses.length }}</strong>
      block producers elected from
      <strong>{{ witnesses.length }}</strong> witnesses.
    </small>

    <ul class="tabResults labels">
      <li v-if="showTitle" id="list_title">
        <span class="delegateID">#</span>
        <span class="producer">
          <input
            ref="filterField"
            v-model="filterAddressQuery"
            type="text"
            placeholder="Address"
            @keyup="filterByAddress()"
          />
        </span>
        <span class="stake">Stake</span>
        <span class="vote"></span>
      </li>
    </ul>
    <div v-if="isLoaded" class="scroll inner">
      <ul class="tabResults main">
        <li
          v-for="(witness, idx) in displayedWitnesses"
          :key="idx"
          :class="{ changed: isChanged(witness.Id) }"
        >
          <span class="mobileLabel">#</span>
          <span class="delegateID">{{ idx + 1 }}</span>
          <span class="mobileLabel">Address</span>
          <span class="producer address">
            <router-link :to="{ path: '/search/' + witness.Id }">
              {{ witness.Id }}
            </router-link>
          </span>
          <span class="mobileLabel">Stake</span>
          <span class="stake"
            >{{ (witness.Stake / 10000).toFixed(4) }} <small>EBK</small></span
          >
          <span class="mobileLabel">Vote</span>
          <span class="vote">
            <button
              v-if="!isMyVotesLoading && isMyVotesLoaded"
              @click="toggleVote(witness.Id)"
            >
              {{ isVoted(witness.Id) ? 'Unvote' : 'Vote' }}
            </button>
          </span>
        </li>
        <li v-if="displayedWitnesses.length === 0">
          No witness found!
        </li>
      </ul>
    </div>
    <div v-if="!isLoaded">Loading...</div>
    <div v-if="isLoaded" class="actions_area">
      <span>
        You have used {{ newVoting.length }} out of {{ MaxVotes }} votes.
      </span>

      <span v-if="hasReachedMaxVotes && error === ''" class="danger">
        Maximum number of votes reached.
      </span>

      <span v-if="error !== ''" class="danger">
        {{ error }}
      </span>

      <button v-if="hasChangedVotes" @click="submitVotes()">
        Submit changes
      </button>
    </div>
  </div>
</template>

<script>
import Web3 from 'web3'
import Web3Ebakus from 'web3-ebakus'
import ebakusWallet from 'ebakus-web-wallet-loader'
import { debounce } from 'lodash'
import { backOff } from 'exponential-backoff'

import { RouteNames } from '@/router'
import { weiToEbk } from '@/utils'

const BACKOFF_SETTINGS = { maxDelay: 30 * 1000, numOfAttempts: 100 }
const MAX_VOTES = 20
const DEBOUNCE_DELAY = 1000

const SystemContractAddress = '0x0000000000000000000000000000000000000101'
const SystemContractVoteABI = [
  {
    type: 'function',
    name: 'getStaked',
    inputs: [],
    outputs: [
      {
        type: 'uint64',
      },
    ],
    constant: true,
    payable: false,
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'vote',
    inputs: [
      {
        name: 'addresses',
        type: 'address[]',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'unvote',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
]

export default {
  data() {
    return {
      witnesses: [],
      displayedWitnesses: [],
      currentlyVoted: [],
      newVoting: [],
      filterAddressQuery: '',
      myAddress: null,
      showTitle: false,

      web3: null,
      web3Endpoint: process.env.WEB3JS_NODE_ENDPOINT,
      web3Connecting: false,
      isWalletConnected: false,
      contractInstance: null,

      isLoaded: false,
      isWitnessesLoading: false,
      isMyVotesLoading: false,
      isMyVotesLoaded: false,
      error: '',
    }
  },
  computed: {
    RouteNames: () => RouteNames,
    MaxVotes: () => MAX_VOTES,
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
  created: function() {
    const self = this

    this.web3 = Web3Ebakus(new Web3(this.web3Endpoint))

    window.addEventListener('ebakusCurrentProviderEndpoint', function({
      detail: endpoint,
    }) {
      self.resetWeb3Connection()
      self.connect()
    })

    window.addEventListener('ebakusConnectionStatus', function({
      detail: status,
    }) {
      self.resetWeb3Connection()

      if (status == 'connected') {
        self.connect()
      }
    })

    window.addEventListener('ebakusStaked', function({ detail: staked }) {
      if (self.web3 === null) {
        return
      }
      self.loadWitnesses()
      self.loadCurrentlyVoted()
    })
  },
  mounted: function() {
    const opts = {}
    if (process.env.WALLET_ENDPOINT) {
      opts.walletEndpoint = process.env.WALLET_ENDPOINT
    }

    ebakusWallet.init(opts)
  },
  methods: {
    weiToEbk: weiToEbk,

    resetWeb3Connection: function() {
      this.$set(this, 'isWalletConnected', false)
      this.$set(this, 'web3', null)
      this.$set(this, 'contractInstance', null)
    },
    connect: debounce(async function() {
      console.log('TCL: connect')
      if (this.web3Connecting) {
        return
      }
      this.web3Connecting = true
      try {
        const endpoint = await ebakusWallet.getCurrentProviderEndpoint()
        if (this.web3 === null || endpoint !== this.web3Endpoint) {
          this.web3Endpoint = endpoint

          this.web3 = Web3Ebakus(new Web3(this.web3Endpoint))
          this.error = null
        }

        await this.fetchAccount()
        await this.getWeb3ContractInstance()

        this.loadWitnesses()
        this.loadCurrentlyVoted()

        this.$set(this, 'isWalletConnected', true)

        this.web3Connecting = false
      } catch (err) {
        console.error('Failed to retrieve provider endpoint from wallet', err)

        this.web3Connecting = false

        this.error = 'Failed to connect, retrying...'

        this.resetWeb3Connection()
      }
    }, DEBOUNCE_DELAY),
    fetchAccount: async function() {
      try {
        const address = await ebakusWallet.getDefaultAddress()
        this.myAddress = address

        this.loadCurrentlyVoted()
      } catch (err) {
        console.error('Failed to retrieve user address from wallet', err)
      }
    },
    getWeb3ContractInstance: async function() {
      if (this.contractInstance !== null) {
        return this.contractInstance
      }

      if (this.web3 === null) {
        throw 'web3 is not set'
      }

      const systemContract = new this.web3.eth.Contract(
        SystemContractVoteABI,
        SystemContractAddress
      )

      this.$set(this, 'contractInstance', systemContract)

      return systemContract
    },

    loadWitnesses: async function() {
      if (this.isWitnessesLoading) return

      try {
        this.isWitnessesLoading = true
        this.witnesses = []
        const iter = await this.web3.db.select(
          SystemContractAddress,
          'Witnesses',
          'Flags == 1',
          'Stake DESC',
          'latest'
        )

        let witness = null

        do {
          witness = await this.web3.db.next(iter)
          if (witness != null) {
            this.witnesses.push(witness)
          }
        } while (witness != null)

        this.displayedWitnesses = this.witnesses
        this.isLoaded = true
        this.showTitle = true
      } catch (err) {
        console.error('Failed to fetch witnesses', err)

        this.isLoaded = false
        this.showTitle = false

        if (err.message.includes('connection not open')) {
          this.resetWeb3Connection()
          this.connect()
        }
      }

      this.isWitnessesLoading = false
    },

    loadCurrentlyVoted: async function() {
      if (this.isMyVotesLoading) return

      this.isMyVotesLoading = true

      this.currentlyVoted = []
      this.newVoting = []

      try {
        const iter = await this.web3.db.select(
          SystemContractAddress,
          'Delegations',
          'Id LIKE ' + this.myAddress,
          '',
          'latest'
        )

        let delegation = null

        do {
          delegation = await this.web3.db.next(iter)
          if (delegation != null) {
            const to = this.web3.utils.bytesToHex(delegation.Id.slice(20))
            this.currentlyVoted.push(to)
            this.newVoting.push(to)
          }
        } while (delegation != null)

        this.isMyVotesLoaded = true
      } catch (err) {
        console.error('Failed to fetch voted witnesses', err)
        this.isMyVotesLoaded = false
        if (err.message.includes('connection not open')) {
          this.resetWeb3Connection()
          this.connect()
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
      if (this.contractInstance === null) {
        this.error = 'Please check that wallet is connected.'
        return
      }

      this.error = null

      try {
        let cmd
        if (this.newVoting.length > 0) {
          cmd = this.contractInstance.methods.vote(this.newVoting)
        } else {
          cmd = this.contractInstance.methods.unvote()
        }

        const tx = {
          to: SystemContractAddress,
          data: cmd.encodeABI(),
        }

        const staked = await ebakusWallet.getStaked()
        if (staked > 0) {
          const estimatedGas = await cmd.estimateGas({
            from: this.myAddress,
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#statistics_wrapper {
  display: none;
  height: 50px;
  height: 100%;
}
#statistics_wrapper.active {
  opacity: 1;
  display: block;
}
.container {
  margin: 0 auto;
}

.actions_area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px;
  border-top: 1px solid #c6c6c6;
  background-color: #fff;
}

.actions_area span {
  float: left;
}
.actions_area .danger {
  margin-left: 4px;
}

.actions_area button {
  float: right;
  display: block;
  padding: 12px 18px;
  margin: -10px 0;
  border-radius: 10px;
  color: white;
  background: #fe4184;
  font-size: 16px;
  font-weight: 600;
  transition: 0.5s all ease;
  transform: scale(1);
  border: 0;
  cursor: pointer;
  outline: none;
}

#tabbar .scroll.inner {
  height: calc(100% - 150px - 110px) !important;
}

li a {
  display: block;
  padding: 22px 1%;
  transition: 0.1s all ease-in-out;
  text-decoration: none;
  color: #31baf3;
  opacity: 0.85;
}
li a:visited {
  color: #31baf3;
}
li a:hover {
  box-shadow: 0 2px 33px 0 rgba(17, 47, 66, 0.1);
  opacity: 1;
}
li span {
  display: inline-block;
  width: 10%;
  margin: 0 1%;
  text-align: center;
  vertical-align: middle;
}
li button {
  min-width: 70px;
  padding: 6px 12px;
  border-radius: 4px;
  background: #f8f8f8;
  font-size: 12px;
  outline: none;
}
li.changed {
  background-color: #e6ffeb;
}
.delegateID {
  width: 6%;
  text-align: left;
  margin: 0;
}
span.delegateID {
  font-weight: 600;
}
span.producer {
  width: 50%;
  margin: 0;
  text-overflow: ellipsis;
  overflow: hidden;
}

.labels span.producer {
  text-align: left;
}
.labels span.producer input {
  width: 100%;
  padding-top: 4px;
  padding-bottom: 4px;
  box-sizing: border-box;
  font-size: 14px;
  font-weight: 400;
  color: #828383 !important;
  opacity: 0.8;
}
.missedBlocks small,
.density small {
  display: none;
}
.missedBlocks p,
.density p {
  margin-top: 0;
  margin-bottom: 0;
}

#list_title {
  padding: 0px 1%;
}
#list_title span {
  font-size: 14px;
  color: #828383 !important;
  font-weight: 400;
  opacity: 0.8;
}
.scroll {
  overflow: auto;
  height: 100%;
  -webkit-overflow-scrolling: touch;
}
.mobileLabel {
  display: none;
}
.danger {
  color: #f44336;
}
@media (max-width: 560px) {
  #tabbar .scroll.inner {
    height: calc(100% - 57px - 93px) !important;
    overflow-x: hidden !important;
  }

  li {
    position: relative;
    width: 100vw;
    overflow: hidden;
    padding-top: 10px;
    padding-bottom: 15px;
    border-bottom: 2px solid #f0f0f0;
  }
  li span {
    display: block;
    width: 100vw;
    margin: 0px;
  }
  li span:first-child {
    margin: 0px;
  }
  li a {
    display: initial;
    padding: 0;
  }
  span.producer {
    width: calc(100% - 80px);
  }
  a {
    position: relative;
    width: 100%;
    overflow: hidden;

    border-bottom: 2px solid #f0f0f0;
  }
  li span {
    font-size: 14px;
    text-align: left;
    padding-left: 80px;
    font-weight: 600;
  }
  .mobileLabel {
    display: block;
    width: 70px;
    font-size: 13px;
    margin-bottom: 10px !important;
    position: absolute;
    left: 0px;
    padding-left: 10px !important;
    background: #fff;
    font-weight: 400;
  }
  li.changed .mobileLabel {
    background-color: #e6ffeb;
  }
  .missedBlocks small,
  .density small {
    display: inline-block;
    color: #112f42;
  }
  .time {
    display: none;
  }
  li button {
    min-width: 70px;
    padding: 4px 8px;
    font-size: 10px;
  }
  .actions_area {
    padding: 8px;
    text-align: center;
  }
  .actions_area span {
    float: none;
    font-size: 14px;
  }
  .actions_area button {
    float: none;
    margin: 6px auto 0;
    padding: 8px 14px;
    font-size: 14px;
  }
}
</style>
