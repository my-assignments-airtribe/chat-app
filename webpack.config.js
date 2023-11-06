const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const Dotenv = require('dotenv-webpack');
const webpack = require('webpack')
const dotenv = require('dotenv')

dotenv.config();

module.exports = {
  entry: './src/client/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test:/\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        use: ['file-loader']
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader', // Creates `style` nodes from JS strings
          'css-loader',   // Translates CSS into CommonJS
          'sass-loader'   // Compiles Sass to CSS
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env)
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 3000,
    open: true,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
      },
    },
    historyApiFallback: true,
  }
};
