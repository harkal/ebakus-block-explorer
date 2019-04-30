import abiDecoder from 'abi-decoder'

const decodeDataUsingAbi = (abi, data) => {
  if (!abi || !data) {
    return
  }

  const abiDecoderInstance = new abiDecoder.AbiDecoder()
  abiDecoderInstance.addABI(abi)

  return abiDecoderInstance.decodeMethod(data)
}

const getValueForParam = (name, params) => {
  const obj = params.find(item => item.name === name)
  return obj && obj.value
}

export { decodeDataUsingAbi, getValueForParam }
