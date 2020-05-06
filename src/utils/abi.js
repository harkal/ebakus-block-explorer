import Vue from 'vue'
import memoize from 'lodash/memoize'
import debounce from 'lodash/debounce'
import abiDecoder from 'abi-decoder'

const getAbiWithCaching = memoize(async contractAddress => {
  const res = await Vue.http.get(
    process.env.API_ENDPOINT + '/abi/' + contractAddress
  )

  return res.data
})

const cleanAbiCache = debounce(function(contractAddress) {
  getAbiWithCaching.cache.delete(contractAddress)
}, 2000)

const getAbi = async contractAddress => {
  try {
    return await getAbiWithCaching(contractAddress)
  } catch (err) {
    cleanAbiCache(contractAddress)
    return
  }
}

const decodeDataUsingAbi = (abi, data) => {
  if (!abi || !data) {
    return {}
  }

  const abiDecoderInstance = new abiDecoder.AbiDecoder()
  abiDecoderInstance.addABI(abi)

  return abiDecoderInstance.decodeMethod(data)
}

const getValueForParam = (name, params) => {
  const obj = params.find(item => item.name === name)
  return obj && obj.value
}

export { getAbi, decodeDataUsingAbi, getValueForParam }
