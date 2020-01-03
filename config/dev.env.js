const merge = require('webpack-merge')
const prodEnv = require('./mainnet.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  API_ENDPOINT: '"https://explorersrv.ebakus.com"',
  WEB3JS_NODE_ENDPOINT: '"ws://127.0.0.1:8546"',
})
