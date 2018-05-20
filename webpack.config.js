const path = require('path');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const mode = argv.mode || 'development';
  const isDevMode = (mode === 'development');
  const plugins = (isDevMode)? [new webpack.HotModuleReplacementPlugin()] : [];
  
  console.log(`mode: ${mode}`);

  return {
    mode: mode,
    devtool: 'inline-source-map',
    entry: {
      'index': [path.resolve(__dirname, 'src/index.jsx')]
    },
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'public'),
      publicPath: './public',
    },
    devServer: {
      contentBase: path.join(__dirname, '/public'),
      publicPath: '/',
      hot: true
    },
    plugins: plugins,
    module: {
      rules: [{
          test: /\.(js|jsx)$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          options: {
            babelrc: false,
            presets: ["es2015", "react", "stage-1"],
            plugins: ["transform-decorators-legacy", ["transform-runtime", {
              "polyfill": false,
              "regenerator": true
            }]]
          },
        },
        {
          test: /\.(glsl|frag|vert)$/,
          loader: 'raw-loader',
          exclude: /node_modules/
        },
        {
          test: /\.(glsl|frag|vert)$/,
          loader: 'glslify-loader',
          exclude: /node_modules/
        },
        {
          test: /\.scss/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                url: true,
                sourceMap: isDevMode,
                importLoaders: 2
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: isDevMode,
              }
            }
          ]
        },
        {
          test: /\.(gif|png|jpg|eot|wof|woff|woff2|ttf|svg)$/,
          loader: 'url-loader',
          options: {
            limit: 10000
          }
        },
      ]
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@c': path.resolve(__dirname, 'src/Components'),
      },
      extensions: ['.js', '.jsx'],
    }
  }
}