import Vue from 'vue'
import memoize from 'lodash/memoize'
import debounce from 'lodash/debounce'
import namehash from 'eth-ens-namehash'
import ebakusWallet from 'ebakus-web-wallet-loader'

import { web3, checkConnectionError } from '@/utils/web3ebakus'
import { isZeroHash } from '.'

const ContractAddress = process.env.ENS_CONTRACT_ADDRESS

let _contract

const getEnsContract = async () => {
  if (!ContractAddress) return
  if (_contract) return _contract

  try {
    let contractABI = await web3.eth.getAbiForAddress(ContractAddress)
    contractABI = JSON.parse(contractABI)

    _contract = new web3.eth.Contract(contractABI, ContractAddress)
    return _contract
  } catch (err) {
    await checkEnsConnectionError(err)
  }
}

const resetContract = async () => {
  _contract = null
}

const checkEnsConnectionError = async err => {
  return await checkConnectionError(err, {
    preInit: async () => {
      resetContract()
    },
    postInit: async () => {
      await getEnsContract()
    },
  })
}

const getAddressWithCaching = memoize(async hash => {
  const contract = await getEnsContract()
  if (!contract) return null

  const address = await contract.methods.getAddress(hash).call()
  return isZeroHash(address) ? null : address
})

const cleanAddressCache = debounce(function(hash) {
  getAddressWithCaching.cache.delete(hash)
}, 2000)

const getAddressForEns = async name => {
  const hash = namehash.hash(name)

  try {
    return await getAddressWithCaching(hash)
  } catch (err) {
    if (await checkEnsConnectionError(err)) {
      return getAddressForEns(name)
    }

    cleanAddressCache(hash)
    return false
  }
}

const registerNameForAddress = async (name, address) => {
  const hash = namehash.hash(name)

  try {
    const contract = await getEnsContract()
    if (!contract) throw new Error("ENS contract can't be loaded")

    const registrationAmount = await contract.methods
      .getRegistrationAmount()
      .call()

    const cmd = contract.methods.register(hash, address)

    const tx = {
      to: ContractAddress,
      value: registrationAmount,
      data: cmd.encodeABI(),
    }

    const gas = await web3.eth.estimateGas(tx)
    tx.gas = gas + 10000

    const res = await ebakusWallet.sendTransaction(tx)

    return res && res.status
  } catch (err) {
    if (await checkEnsConnectionError(err)) {
      return await registerNameForAddress(name, address)
    }

    throw err
  }
}

const getEnsNameForAddressWithCaching = memoize(async address => {
  try {
    const res = await Vue.http.get(process.env.API_ENDPOINT + '/ens/' + address)

    const { data: { name } = {} } = res
    return name
  } catch (err) {
    console.error('Failed to find ENS name for address', err)
  }
})

const cleanEnsNameForAddressCache = debounce(function(hash) {
  getAddressWithCaching.cache.delete(hash)
}, 2000)

const getEnsNameForAddress = async address => {
  try {
    return await getEnsNameForAddressWithCaching(address)
  } catch (err) {
    cleanEnsNameForAddressCache(address)
    return
  }
}

const storeEnsNameForAddress = async (name, address) => {
  const hash = namehash.hash(name)

  try {
    const res = await Vue.http.post(process.env.API_ENDPOINT + '/ens', {
      address,
      name,
      hash,
    })
    return res.ok
  } catch (err) {
    console.log('No address is assigned to ENS address', err)
    return false
  }
}

export {
  registerNameForAddress,
  getAddressForEns,
  getEnsNameForAddress,
  resetContract as resetEnsContract,
  storeEnsNameForAddress,
}
