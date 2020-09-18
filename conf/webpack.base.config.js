const { Config } = require('webpack-config');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = new Config().merge({
  entry: {
    popup: './src/popup/index.tsx',
    background: './src/background/index.ts',
    options: './src/options/index.tsx',
  },
  output: {
    filename: '[name]/index.js',
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.tsx?$/,
        use: 'eslint-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.tsx?$/,
        use: 'awesome-typescript-loader',
        exclude: /node_modules/,
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        use: 'source-map-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
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
