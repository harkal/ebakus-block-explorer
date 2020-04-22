import Vue from 'vue'
import memoize from 'lodash/memoize'
import debounce from 'lodash/debounce'
import namehash from 'eth-ens-namehash'

import { web3, initWeb3 } from '@/utils/web3ebakus'

const ContractAddress = process.env.ENS_CONTRACT_ADDRESS

let _contract

const getEnsContract = async () => {
  if (!ContractAddress) return
  if (_contract) return _contract

  let contractABI = await web3.eth.getAbiForAddress(ContractAddress)
  contractABI = JSON.parse(contractABI)

  _contract = new web3.eth.Contract(contractABI, ContractAddress)
  return _contract
}

const resetContract = async () => {
  _contract = null
}

const checkConnectionError = async err => {
  if (err.message === 'connection not open') {
    resetContract()
    initWeb3()
    await getEnsContract()
    return true
  }
}

const getAddressWithCaching = memoize(async hash => {
  const contract = await getEnsContract()
  if (!contract) return null

  const address = await contract.methods.getAddress(hash).call()
  return address != '0x0000000000000000000000000000000000000000'
    ? address
    : null
})

const cleanAddressCache = debounce(function(hash) {
  getAddressWithCaching.cache.delete(hash)
}, 2000)

const getAddressForEns = async name => {
  const hash = namehash.hash(name)

  try {
    return await getAddressWithCaching(hash)
  } catch (err) {
    if (await checkConnectionError(err)) {
      return getAddressForEns(name)
    }

    cleanAddressCache(hash)
    return false
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
  getEnsNameForAddress,
  getAddressForEns,
  resetContract,
  storeEnsNameForAddress,
}
