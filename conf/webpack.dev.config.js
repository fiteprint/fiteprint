const path = require('path');
const { Config } = require('webpack-config');
const WebpackWatchPlugin = require('webpack-watch-files-plugin').default;

module.exports = new Config().extend('conf/webpack.base.config.js').merge({
  mode: 'development',
  output: {
    path: path.resolve(__dirname, '../dist/dev'),
  },
  watch: true,
  plugins: [
    new WebpackWatchPlugin({
      files: ['src/**/*.{html,json,png}'],
    }),
  ],
});
