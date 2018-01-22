const MustHave = require('musthave')
const mh = new MustHave({
  throwOnError: false
})

class Endpoint {
  // Last argument must be a callback.
  static validBody (req, res) {
    if (!req.hasOwnProperty('body') || typeof req.body !== 'object') {
      return Endpoint.errorResponse(res, 400, 'No JSON body supplied.')
    }

    let args = NGN.slice(arguments)
    let callback = args.pop()
    args.shift()
    args.shift()

    if (args.length === 0) {
      return callback()
    }

    if (!mh.hasAll(req.body, ...args)) {
      return Endpoint.errorResponse(res, 400, `Missing parameters: ${mh.missing.join(', ')}`)
    }

    callback()
  }

  static errorResponse (res, status = 500, message = 'Invalid Request') {
    // If the last argument is an error, use it.
    // if (arguments.length > 0) {//arguments[arguments.length - 1]) {
    if (arguments[arguments.length - 1] instanceof Error) {
      let err = arguments[arguments.length - 1]
      status = typeof status === 'number' ? status : 400

      // Hide sensitive errors in non-debugging mode
      if (DEBUG) {
        message = err.message
      } else {
        if (['SQLError'].indexOf(err.name) >= 0) {
          let id = NGN.DATA.util.GUID()

          console.log(`[${id}] ${(new Date()).toISOString()} ${err.message}`)

          message = `Server Error (#${id})`
        } else {
          message = err.message
        }
      }
    }

    res.status(status).json({ status, message })
  }

  static validId (req, res, callback) {
    if (!req.params.id) {
      return Endpoint.errorResponse(res, 400, 'No ID specified in URL.')
    }

    // Prevent SQL code injection by forcing accurate data type.
    try {
      let id = parseInt(req.params.id, 10)

      if (isNaN(id)) {
        throw new Error(`"${req.params.id}" is an invalid ID.`)
      }

      callback(id)
    } catch (e) {
      return Endpoint.errorResponse(res, 400, e.message)
    }
  }

  static validResult (res, callback) {
    return (err, result) => {
      if (err) {
        return Endpoint.errorResponse(res, 500, err)
      }

      callback(result)
    }
  }

  // ASCII to Binary
  // This mimics the browser's window.atob function.
  // This is used to extract username/password from a request.
  static atob (str) {
    return new Buffer(str, 'base64').toString('binary')
  }
}

module.exports = Endpoint
