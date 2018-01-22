const email = require('../email')

module.exports = (app) => {
  return {
    restart: (req, res) => {
      let proc = req.params.name.replace(/[^\w]/gi, '')
      let cmd = NGN.coalesce(process.env.SERVICE_RESTART_COMMAND, 'systemctl restart {{name}}').replace('{{name}}', proc)

      exec(cmd, {
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
