const path = require('path')
const { Config } = require('webpack-config')

module.exports = new Config().extend('conf/webpack.base.config.js').merge({
  mode: 'production',
  output: {
    path: path.resolve(__dirname, '../dist/prod'),
  },
})
