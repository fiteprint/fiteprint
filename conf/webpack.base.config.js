const { Config } = require('webpack-config');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = new Config().merge({
  entry: {
    popup: './src/popup/index.ts',
    background: './src/background/index.ts',
    options: './src/options/index.ts',
  },
  output: {
    filename: '[name]/index.js',
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.ts$/,
        use: 'eslint-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts'],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: '**/*.{html,json,png}',
          context: './src',
        },
      ],
      options: {
        concurrency: 10,
      },
    }),
    new CleanWebpackPlugin(),
  ],
});
