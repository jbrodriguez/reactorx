var path = require('path')
var webpack = require('webpack')

module.exports = {
	devtool: 'inline-source-map',
	entry: [
		'webpack-hot-middleware/client?reload=true',
		'./client/index.js'
	],
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'bundle.js',
		publicPath: '/static/'
	},
	plugins: [
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin(),
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
		},{
			test: /\.json?$/,
			loader: 'json'
		}]
	}
}
