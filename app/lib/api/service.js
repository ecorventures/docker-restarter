const nodemailer = require('nodemailer')
const exec = require('child_process').exec
const emailEnabled = !(!process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.SMTP_SERVICE || !process.env.NOTIFICATION_RECIPIENT || !process.env.NOTIFICATION_SENDER)
let transporter

if (emailEnabled) {
  let opt = {}

  if (process.env.SMTP_SERVICE) {
    opt.service = process.env.SMTP_SERVICE
  }

  if (process.env.SMTP_USER) {
    opt.auth = NGN.coalesce(opt.auth, {})
    opt.auth.user = process.env.SMTP_USER
  }

  if (process.env.SMTP_PASSWORD) {
    opt.auth = NGN.coalesce(opt.auth, {})
    opt.auth.user = process.env.SMTP_PASSWORD
  }

  if (process.env.SMTP_HOST) {
    opt.host = process.env.SMTP_HOST
  }

  opt.port = NGN.coalesce(process.env.SMTP_PORT, 587)
  opt.secure = opt.port === 465

  transporter = nodemailer.createTransport(opt)
}

const email = (subject, message, callback) => {
  if (!emailenabled) {
    return callback()
  }

  transporter.sendMail({
    from: process.env.NOTIFICATION_SENDER,
    to: process.env.NOTIFICATION_RECIPIENT,
    subject,
    html: message
  }, (err, info) => {
    console.log(NGN.coalesce(err, info))
    callback()
  })
}

module.exports = (app) => {
  return {
    restart: (req, res) => {
      let proc = req.params.name.replace(/[^\w]/gi, '')

      exec(`systemctl restart ${proc}`, {
        env: process.env
      }, (err, stdout, stderr) => {
        let error = null

        if (err) {
          error = err.message
          console.log(err)
        } else if (stderr && stderr.trim().length > 0) {
          error = stderr
          console.log(stderr)
        } else {
          console.log(stdout)
        }

        email(
          error ? `Error restarting ${proc}` : `${proc} restarted successfully.`,
          error ? error : `The process was restarted successfully on ${(new Date()).toLocaleDateString()} at ${(new Date()).toLocaleTimeString()} with the following message:\n\n${stdout}`,
          () => res.sendStatus(200)
        )
      })
    },

    deploy: (req, res) => {
      if (!NGN.coalesce(process.env.DEPLOY_COMMAND)) {
        console.log('Deployer not configured.')
        return res.sendStatus(200)
      }

      exec(`cd ${req.params.directory} && ${process.env.DEPLOY_COMMAND}`, {
        env: process.env
      }, (err, stdout, stderr) => {
        let error = null

        if (err) {
          error = err.message
          console.log(err)
        } else if (stderr && stderr.trim().length > 0) {
          error = stderr
          console.log(stderr)
        } else {
          console.log(stdout)
        }

        email(
          error ? `Error deploying ${req.params.directory}` : `Deployment Complete`,
          error ? error : `The deployment succeeded on ${(new Date()).toLocaleDateString()} at ${(new Date()).toLocaleTimeString()} with the following message:\n\n${stdout}`,
          () => res.sendStatus(200)
        )

        res.sendStatus(200)
      })
    }
  }
}
