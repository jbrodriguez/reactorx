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
				presets: ['react', 'es2015', 'stage-2']
			}
		}, {
			test: /\.json?$/,
			loader: 'json'
		}, { 
			test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, 
			loader: "url-loader?limit=10000&minetype=application/font-woff&name=img/[name]-[hash:7].[ext]"
		}, { 
			test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, 
			loader: "file?hash=sha512&digest=hex&name=img/[name]-[hash:7].[ext]"
		}]
	}
}