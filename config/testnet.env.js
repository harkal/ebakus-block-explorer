const merge = require('webpack-merge')
const prodEnv = require('./mainnet.env')

module.exports = merge(prodEnv, {
  API_ENDPOINT: '"https://explorer-api.ebakus-testnet.com"',
  WEB3JS_NODE_ENDPOINT: '"wss://ws.ebakus-testnet.com"',
  WALLET_ENDPOINT: '"https://wallet.ebakus-testnet.com"',
})
