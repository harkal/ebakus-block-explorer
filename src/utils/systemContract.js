import namehash from 'eth-ens-namehash'

import { web3, checkConnectionError } from '@/utils/web3ebakus'
import { asyncTimeout } from '.'
import { decodeDataUsingAbi } from './abi'

const ContractAddress = '0x0000000000000000000000000000000000000101'

let _contract
let _contractAbi

const getContractAbi = async () => {
  if (!!_contractAbi) return _contractAbi

  try {
    const contractAbi = await web3.eth.getAbiForAddress(ContractAddress)
    _contractAbi = JSON.parse(contractAbi)

    return _contractAbi
  } catch (err) {}
  return
}

const getContract = async () => {
  if (!ContractAddress) return
  if (_contract) return _contract

  try {
    const contractAbi = await getContractAbi()
    _contract = new web3.eth.Contract(contractAbi, ContractAddress)
    return _contract
  } catch (err) {
    if (await checkContractConnectionError(err)) {
      await asyncTimeout(1000)
      return await getContract()
    }
  }
}

const resetContract = async () => {
  _contract = null
}

const checkContractConnectionError = async err => {
  return await checkConnectionError(err, {
    preInit: async () => {
      resetContract()
    },
    postInit: async () => {
      await getContract()
    },
  })
}

const registerNameForAddress = async (name, address) => {
  const hash = namehash.hash(name)

  try {
    const contract = await getContract()
    if (!contract) throw new Error("ENS contract can't be loaded")

    await contract.methods.register(hash).send()
  } catch (err) {
    if (await checkContractConnectionError(err)) {
      return await registerNameForAddress(name, address)
    }

    throw err
  }
}

const decodeInputData = input => {
  if (!_contractAbi) {
    console.warn('System contract ABI not loaded')
    return
  }
  return decodeDataUsingAbi(_contractAbi, input)
}

export {
  ContractAddress as SystemContractAddress,
  getContractAbi as getSystemContractAbi,
  getContract as getSystemContract,
  resetContract as resetSystemContract,
  decodeInputData as decodeSystemContractData,
}
