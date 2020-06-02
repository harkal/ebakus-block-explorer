const webpack = require('webpack')
const CompressionPlugin = require('compression-webpack-plugin')

const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const env = IS_PRODUCTION
  ? process.env.IS_TESTNET
    ? require('./config/testnet.env')
    : require('./config/mainnet.env')
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

      new CompressionPlugin({
        filename: '[path].gz[query]',
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 10240,
        minRatio: 0.8,
      }),

      new CompressionPlugin({
        filename: '[path].br[query]',
        algorithm: 'brotliCompress',
        test: /\.(js|css|html|svg)$/,
        compressionOptions: {
          // zlib’s `level` option matches Brotli’s `BROTLI_PARAM_QUALITY` option.
          level: 11,
        },
        threshold: 10240,
        minRatio: 0.8,
        deleteOriginalAssets: false,
      }),
    ],
  },
  chainWebpack: config => {},
  productionSourceMap: false,
}
