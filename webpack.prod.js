const webpack = require('webpack')
const merge = require('webpack-merge')
const common = require('./webpack.common.js')

// const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = merge(common, {
  mode: 'production',
  optimization: {
    minimizer: [
      // new UglifyJsPlugin({
      //   cache: true,
      //   parallel: true,
      //   uglifyOptions: {
      //     uglifyOptions: {
      //       mangle: false,
      //       output: {
      //         beautify: true,
      //         comments: true,
      //         semicolons: false
      //       }
      //     }
      //   }
      // })
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      USERSTUDY_CONDITION: 6,
      'EXT.DEBUG': true
    })
  ]
})
