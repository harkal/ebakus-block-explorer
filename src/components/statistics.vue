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
        <span class="producer">Address</span>
        <span class="stake">Stake</span>
        <span class="vote"></span>
      </li>
    </ul>
    <div v-if="isLoaded" class="scroll inner">
      <ul class="tabResults main">
        <li
          v-for="(witness, idx) in witnesses"
          :key="idx"
          :class="{ changed: isChanged(witness.Id) }"
        >
          <span class="mobileLabel">#</span>
          <span class="delegateID">{{ idx }}</span>
          <span class="mobileLabel">Address</span>
          <span class="producer address">
            <router-link :to="{ path: '/search/' + witness.Id }">
              {{ witness.Id }}
            </router-link>
          </span>
          <span class="mobileLabel">Stake</span>
          <span class="stake">{{ witness.Stake }}</span>
          <span class="mobileLabel">Vote</span>
          <span class="vote">
            <button v-if="isMyVotesLoaded" @click="toggleVote(witness.Id)">
              {{ isVoted(witness.Id) ? 'Unvote' : 'Vote' }}
            </button>
          </span>
        </li>
      </ul>
    </div>
    <div v-if="!isLoaded">Loading...</div>
    <div v-if="isLoaded" class="actions_area">
      <span>
        You have used {{ newVoting.length }} out of {{ MaxVotes }} votes.
      </span>
      <span v-if="hasReachedMaxVotes" class="danger">
        &nbsp;Maximum number of voted reached.
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

import { RouteNames } from '@/router'
import { weiToEbk } from '@/utils'

const MAX_VOTES = 20

const web3 = Web3Ebakus(new Web3(process.env.WEB3JS_NODE_ENDPOINT))

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

const systemContract = new web3.eth.Contract(
  SystemContractVoteABI,
  SystemContractAddress
)

export default {
  data() {
    return {
      witnesses: [],
      currentlyVoted: [],
      newVoting: [],
      myAddress: null,
      showTitle: false,
      isLoaded: false,
      isMyVotesLoaded: false,
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
  watch: {
    witnesses: function() {
      this.isLoaded = true
      this.showTitle = true
    },
  },
  created: function() {
    const self = this

    window.addEventListener('ebakusLoaded', function() {
      self.loadMyAddressFromWallet()
    })

    ebakusWallet.init('https://wallet.ebakus.test')

    this.loadWitnesses()
  },
  methods: {
    weiToEbk: weiToEbk,

    loadMyAddressFromWallet: async function() {
      try {
        const address = await ebakusWallet.getDefaultAddress()
        this.myAddress = address

        this.loadCurrentlyVoted()
      } catch (err) {
        console.log('Failed to retrieve user address from wallet', err)
      }
    },

    loadWitnesses: async function() {
      this.witnesses = []
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
          this.witnesses.push(witness)
        }
      } while (witness != null)

      this.isLoaded = true
      this.showTitle = true
    },

    loadCurrentlyVoted: async function() {
      this.currentlyVoted = []
      this.newVoting = []

      const iter = await web3.db.select(
        SystemContractAddress,
        'Delegations',
        'Id LIKE ' + this.myAddress,
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
      try {
        const vote = systemContract.methods.vote(this.newVoting)

        const tx = {
          to: SystemContractAddress,
          // gas: estimatedGas,
          data: vote.encodeABI(),
        }

        try {
          const estimatedGas = await vote.estimateGas({
            from: this.myAddress,
            gas: 300000,
          })
          tx.gas = estimatedGas
        } catch (err) {
          console.log(
            "Voting gas estimation failed, though it can be because we have no stake yet, so let's continue to wallet"
          )
        }
        const res = await ebakusWallet.sendTransaction(tx)
        if (res && res.status) {
          this.loadWitnesses()
          this.loadCurrentlyVoted()
        }
      } catch (err) {
        console.error('Voting failed', err)
      }
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
  border-radius: 10px;
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
    width: 100vw;
    overflow: hidden;
  }
  li span {
    display: block;
    width: 100vw;
    margin: 0px;
  }
  li span:first-child {
    margin: 0px;
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
    display: inline-block;
    width: 70px;
    font-size: 13px;
    margin-bottom: 10px !important;
    position: absolute;
    left: 0px;
    padding-left: 10px !important;
    background: #fff;
    font-weight: 400;
  }
  .missedBlocks small,
  .density small {
    display: inline-block;
    color: #112f42;
  }
  .time {
    display: none;
  }
}
</style>
