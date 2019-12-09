const webpack = require('webpack')

const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const env = IS_PRODUCTION
  ? require('./config/prod.env')
  : require('./config/dev.env')

module.exports = {
  // runtimeCompiler: true,
  configureWebpack: {
    devServer: {
      host: '0.0.0.0',
      disableHostCheck: !!process.env.DISABLE_HOST_CHECK,
    },
    plugins: [
      // new webpack.optimize.LimitChunkCountPlugin({
      //   maxChunks: 1,
      // }),
      new webpack.DefinePlugin({
        'process.env': env,
      }),
    ],
  },
  chainWebpack: config => {},
  productionSourceMap: false,
}
