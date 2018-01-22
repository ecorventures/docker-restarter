const endpoint = require('./endpoint')
const username = process.env.USERNAME
const password = process.env.PASSWORD

const insecureEndpoints = new Set([
  '/ping'
])

class Authorization {
  static extractBasicAuth (req) {
    let credentials = endpoint.atob(req.headers.authorization.split(/\s{1,10}/i)[1]).split(':')

    return {
      username: credentials[0],
      password: credentials[1]
    }
  }

  static basic (req, res, next) {
    if (!req.headers.hasOwnProperty('authorization')) {
      return res.sendStatus(401)
    }

    try {
      let credentials = Authorization.extractBasicAuth(req)

      if (credentials.username === username && credentials.password === password) {
        req.user = credentials.username
        return next()
      }

      return res.sendStatus(401)
    } catch (e) {
      return endpoint.errorResponse(res, 500, e.message)
    }
  }

  static secureAll (req, res, next) {
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200)
    }

    if (insecureEndpoints.has(req.path)) {
      console.log('Skipping authentication for', req.path)
      next()
    } else {
      Authorization.basic(...arguments)
    }
  }
}

module.exports = Authorization
