const MustHave = require('musthave')
const nodemailer = require('nodemailer')
const exec = require('child_process').exec
const mh = new MustHave()
const emailEnabled = mh.hasAll(process.env, 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'NOTIFICATION_SENDER')

let transporter

if (emailEnabled) {
  let opt = {}

  if (process.env.SMTP_SERVICE) {
    opt.service = process.env.SMTP_SERVICE
  }

  if (process.env.SMTP_HOST) {
    opt.host = process.env.SMTP_HOST
  }

  if (process.env.SMTP_USER) {
    opt.auth = NGN.coalesce(opt.auth, {})
    opt.auth.user = process.env.SMTP_USER
  }

  if (process.env.SMTP_PASSWORD) {
    opt.auth = NGN.coalesce(opt.auth, {})
    opt.auth.pass = process.env.SMTP_PASSWORD
  }

  if (process.env.SMTP_HOST) {
    opt.host = process.env.SMTP_HOST
  }

  opt.port = NGN.coalesce(process.env.SMTP_PORT, 587)
  opt.secure = opt.port === 465

  transporter = nodemailer.createTransport(opt)
}

module.exports = (subject, message, callback) => {
  if (!emailEnabled) {
    if (NGN.isFn(callback)) {
      callback()
    }

    return
  }

  console.log(`Notifying ${process.env.NOTIFICATION_RECIPIENT}...`)

  transporter.sendMail({
    from: `"Autoupdater on ${require('os').hostname()}" <${process.env.NOTIFICATION_SENDER}>`,
    to: NGN.coalesce(process.env.NOTIFICATION_RECIPIENT, process.env.NOTIFICATION_SENDER),
    subject,
    html: message.replace(/\n/gi, '<br/>')
  }, (err, info) => {
    console.log(NGN.coalesce(err, info))
    callback && callback()
  })
}
