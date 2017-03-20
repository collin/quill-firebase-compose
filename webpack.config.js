var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    './src/index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  resolve: {
    alias: {
      'parchment': path.resolve(__dirname, 'node_modules/parchment/src/parchment.ts'),
      'quill$': path.resolve(__dirname, 'node_modules/quill/quill.js'),
    },
    extensions: ['', '.js', '.ts', '.svg']
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['react-hot', 'babel'],
      include: [
        path.join(__dirname, 'src'),
        path.join(__dirname, 'node_modules', 'quill'),
        path.join(__dirname, 'node_modules', 'parchment'),
      ],
    }, {
      test: /\.s?css$/,
      loaders: ['style', 'css', 'sass'],
      include: [
        path.join(__dirname, 'src'),
        path.join(__dirname, 'node_modules', 'quill'),
        path.join(__dirname, 'node_modules', 'parchment'),
      ]
    }, {
      test: /\.ts$/,
      loader: 'ts'
    }, {
      test: /\.svg$/, loader: 'html?minimize=true',
    }]
  }
};
