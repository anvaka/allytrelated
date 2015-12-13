import express from 'express'
import historyApiFallback from 'connect-history-api-fallback'
import config from '../config'

const app = express()
const debug = require('debug')('kit:server')
const paths = config.utils_paths

app.use(historyApiFallback({
  verbose: false
}))

// Serve app with Webpack if HMR is enabled
if (config.compiler_enable_hmr) {
  const webpack = require('webpack')
  const webpackConfig = require('../build/webpack')
  const compiler = webpack(webpackConfig)

  app.use(require('./middleware/webpack-dev')({
    compiler,
    publicPath: webpackConfig.output.publicPath
  }))
  app.use(require('./middleware/webpack-hmr')({ compiler }))
} else {
  debug(
    'Application is being run outside of development mode. Nothing going to happen'
  )

  // Serving `dist` by default. Ideally these files should be served by
  // the web server and not the app server, but this helps to demo the
  // server in production.
  app.use(express.static(paths.base(config.dir_dist)))
}

export default app
