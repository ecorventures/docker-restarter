const NOT_IMPLEMENTED = (req, res) => res.sendStatus(501)
const CORS = require('./api/cors')
const AUTH = require('./api/auth')
const LaunchTime = (new Date()).toISOString()

module.exports = (app) => {
  // Features
  const service = require('./api/service')(app)
  const docker = require('./api/docker')(app)

  // Apply CORS
  app.use(CORS)

  if (NGN.coalesce(process.env.USERNAME) !== null && NGN.coalesce(process.env.PASSWORD) !== null) {
    console.log('API secured using basic authentication.')
    app.use(AUTH.secureAll)
  }

  // Restart a service
  app.post('/service/:name', service.restart)

  // Restart images using a specific container
  app.post('/image', docker.update)
  app.post('/container/:name', docker.container)

  // Healthcheck
  app.get('/ping', (req, res) => res.status(200).json({ runningSince: LaunchTime}))

  app.get('/', NOT_IMPLEMENTED)
}
