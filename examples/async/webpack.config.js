var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
	devtool: 'inline-source-map',
	entry: [
		'webpack-hot-middleware/client?reload=true',
		path.join(__dirname, 'src/main.js')
	],
	output: {
		path: path.join(__dirname, '/dist/'),
		filename: '[name].js',
		publicPath: '/'
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: 'index.tpl.html',
			inject: 'body',
			filename: 'index.html'
		}),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin()
		// new webpack.DefinePlugin({
		// 	'process.env.NODE_ENV': JSON.stringify('development')
		// })
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
