process.on('uncaughtException', err => {
  console.log(err)
})

require('localenvironment')
require('ngn')
require('ngn-data')
require('ngnx-http')

const chalk = require('chalk')

// Optional Debugging
if (typeof process.env.DEBUG === 'string') {
  global.DEBUG = process.env.DEBUG === 'true'
} else {
  global.DEBUG = NGN.coalesce(process.env.DEBUG, false)
}

// Launch the HTTP Server
const server = new NGNX.http.Server({
  ip: '0.0.0.0',
  port: NGN.coalesce(process.env.PORT, 80),
  // autoStart: false,
  refresh: DEBUG
})

// Apply API routes to HTTP server
server.createRoutes('./lib/routes')
