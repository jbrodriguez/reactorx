var path = require('path');
var express = require('express');
var webpack = require('webpack');
var webpackMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var config = require('./webpack.config.js');

const isDeveloping = process.env.NODE_ENV !== 'production';
const port = isDeveloping ? 3000 : process.env.PORT;

const app = express();
const server = require('http').createServer(app);

if (isDeveloping) {
	const compiler = webpack(config);
	const middleware = webpackMiddleware(compiler, {
		publicPath: config.output.publicPath,
		contentBase: 'src',
		stats: {
			colors: true,
			hash: false,
			timings: true,
			chunks: false,
			chunkModules: false,
			modules: false
		}
	});

	app.use(middleware);
	app.use(webpackHotMiddleware(compiler));

	app.get('*', function response(req, res) {
		res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')));
		res.end();
	});

} else {
	app.use(express.static(__dirname + '/dist'));
	app.get('*', function response(req, res) {
		res.sendFile(path.join(__dirname, 'dist/index.html'));
	});
}

server.listen(port, '0.0.0.0', function onStart(err) {
	if (err) {
		console.log(err);
	}
	console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});
