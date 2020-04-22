import Web3 from 'web3'
import Web3Ebakus from 'web3-ebakus'

let web3

const init = () => {
  web3 = Web3Ebakus(new Web3(process.env.WEB3JS_NODE_ENDPOINT))
}

const setProvider = endpoint => {
  web3.setProvider(endpoint)
}

export { web3, init as initWeb3, setProvider }
