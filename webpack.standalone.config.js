var path = require('path')
var webpack = require('webpack')

module.exports = [
  {
    entry: './src/index.js',
    output: {
      filename: './standalone/react-easy-crop.js',
      libraryTarget: 'umd',
      library: 'ReactEasyCrop',
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          use: 'babel-loader',
          exclude: /node_modules/,
        },
      ],
    },
    externals: {
      react: 'React',
    },
    optimization: {
      minimize: false,
    },
  },
  {
    entry: './src/index.js',
    output: {
      filename: './standalone/react-easy-crop.min.js',
      libraryTarget: 'umd',
      library: 'ReactEasyCrop',
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          use: 'babel-loader',
          exclude: /node_modules/,
        },
      ],
    },
    externals: {
      react: 'React',
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production'),
        },
      }),
    ],
  },
]
