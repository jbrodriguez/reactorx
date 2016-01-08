import path 				from 'path'
import express 				from 'express'

import webpack 				from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import config 				from '../webpack.config'

import React 				from 'react'
import { renderToString } 	from 'react-dom/server'

import { createStore } 		from '../../../dist/reactorx'
import actions 				from '../common/actions/counter'
import App 					from '../common/components/app'

const app = express()
const port = 3000

const compiler = webpack(config)
app.use(webpackDevMiddleware(compiler, {noInfo: true, publicPath: config.output.publicPath}))
app.use(webpackHotMiddleware(compiler))

// const html = renderToString(React.createElement(App, store))

app.use( (req, res) => {
	const counter = req.query.counter || 0

	let store = createStore({counter}, actions)

	store.subscribe( store => {
		console.log('store: ', store)
		const html = renderToString(<App store={store} />)
	
		res.set("Content-Type", "text/html")
		res.send(`
			<!doctype html>
			<html>
				<head><title>reactorx universal example</title></head>
				<body>
					<div id="mnt">${html}</div>
					<script>
						window.__INITIAL_STATE__ = ${JSON.stringify(store.state)}
					</script>
					<script src="/static/bundle.js"></script>
				</body>
			</html>
		`)
	})
})

export default app