import namehash from 'eth-ens-namehash'

import { web3, checkConnectionError } from '@/utils/web3ebakus'

const ContractAddress = '0x0000000000000000000000000000000000000101'

let _contract

const getContract = async () => {
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

export {
  ContractAddress as SystemContractAddress,
  getContract as getSystemContract,
  resetContract as resetSystemContract,
}
