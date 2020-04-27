const merge = require('webpack-merge')
const prodEnv = require('./mainnet.env')

module.exports = merge(prodEnv, {
  API_ENDPOINT: '"https://explorer-api.ebakus-testnet.com"',
  WEB3JS_NODE_ENDPOINT: '"wss://ws.ebakus-testnet.com"',
  WALLET_ENDPOINT: '"https://wallet.ebakus-testnet.com"',

  ENS_CONTRACT_ADDRESS: '"0x02C8b1bE10299302D6dD7cCf951D78615fdDC0e6"',

  SHOW_PRICE_IN_USD: true,
})
