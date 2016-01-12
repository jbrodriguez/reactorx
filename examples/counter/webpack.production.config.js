var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
	entry: [
		path.join(__dirname, 'src/main.js')
	],
	output: {
		path: path.join(__dirname, '/dist'),
		filename: 'bundle.js'
	},
	plugins: [
		new webpack.optimize.OccurenceOrderPlugin(),
		new HtmlWebpackPlugin({
			template: 'index.tpl.html',
			inject: 'body',
			filename: 'index.html'
		}),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
		})
	],
	module: {
		loaders: [{
			loader: 'babel',
			exclude: /node_modules/,
			test: /\.jsx?$/,
			query: {
				plugins: ['transform-runtime'],
				presets: ['react', 'es2015', 'stage-2']
			}
		}, {
			test: /\.json?$/,
			loader: 'json'
		}]
	}
}