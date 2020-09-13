const path = require('path');
const glob = require('glob');
const { Config } = require('webpack-config');

module.exports = new Config().extend('conf/webpack.base.config.js').merge({
  mode: 'development',
  target: 'node',
  entry: glob.sync('./src/**/*.test.ts').reduce((points, file) => {
    points[file.replace(/.ts$/, '').split('/').slice(2).join('.')] = file
    return points;
  }, {}),
  output: {
    path: path.resolve(__dirname, '../dist/test'),
    filename: '[name].js',
  },
});
