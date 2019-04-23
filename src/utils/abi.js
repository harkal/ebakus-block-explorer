import abiDecoder from 'abi-decoder'

const decodeDataUsingAbi = (abi, data) => {
  if (!abi || !data) {
    return
  }

  const abiDecoderInstance = new abiDecoder.AbiDecoder()
  abiDecoderInstance.addABI(abi)

  const decodedData = abiDecoderInstance.decodeMethod(data)
  return decodedData
}

const getValueForParam = (name, params) => {
  const obj = params.find(item => item.name === name)
  return obj && obj.value
}

const pprintInput = (abi, input) => {
  const { name, params = [] } = decodeDataUsingAbi(abi, input) || {}
  if (!input || !name) {
    return
  }

  let args = [],
    vals = []

  for (let { name: parName, type, value } of params) {
    args.push(`${type} ${parName}`)
    vals.push(`// "${parName}": ${value}`)
  }

  let out = `Function: ${name}(${args.join(',')}) ***\n\n${vals.join('\n')}`

  return out
}

export { decodeDataUsingAbi, getValueForParam, pprintInput }
