module.exports = (req, res, next) => {
  if (['OPTIONS', 'GET', 'HEAD', 'POST', 'DELETE'].indexOf(req.method) >= 0) {
    res.set('Access-Control-Allow-Origin', req.get('origin') || '*')
    res.set('Access-Control-Allow-Methods', 'GET, HEAD, POST, DELETE')

    if (req.method !== 'OPTIONS') {
      res.set('Access-Control-Max-Age', 3600000)
      res.set('Access-Control-Allow-Credentials', 'true')
    } else {
      res.set('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization')
    }
  } else {
    res.set('Access-Control-Allow-Origin', false)
  }

  next()
}
