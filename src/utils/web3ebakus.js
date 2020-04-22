import Web3 from 'web3'
import Web3Ebakus from 'web3-ebakus'

var asyncNoop = async () => {}

let web3

const init = (endpoint = process.env.WEB3JS_NODE_ENDPOINT) => {
  web3 = Web3Ebakus(new Web3(endpoint))
}

const setProvider = endpoint => {
  web3.setProvider(endpoint)
}

const checkConnectionError = async (err, opts) => {
  if (err.message === 'connection not open') {
    const getProviderEndpoint = opts.getProviderEndpoint
      ? opts.getProviderEndpoint
      : async () => process.env.WEB3JS_NODE_ENDPOINT

    const preInit = opts.preInit ? opts.preInit : noop
    const postInit = opts.postInit ? opts.postInit : noop

    const providerEndpoint = await getProviderEndpoint()

    await preInit()
    init(providerEndpoint)
    await postInit()
    return true
  }
}

export { web3, init as initWeb3, setProvider, checkConnectionError }
