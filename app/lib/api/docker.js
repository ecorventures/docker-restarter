const email = require('../email')
const Tasks = require('shortbus')
const Docker = require('dockerode')
const DockerHostIP = require('os').networkInterfaces().eth0.filter(iFace => iFace.address.indexOf('172.') === 0)[0].address
const docker = new Docker({socketPath: '/var/run/docker.sock'})
const Log = require('../Log')

module.exports = (app) => {
  return {
    update: (req, res) => {
      // console.log(`${req.body.repository.repo_name}:${req.body.push_data.tag}`)
      let runningContainers = []
      let log = new Log()
      let successfulRestarts = []
      let failedRestarts = []

      docker.listContainers((err, containers) => {
        containers.forEach(containerInfo => {
          if (containerInfo.State === 'running') {
            let container = containerInfo.Image.split(':')

            if (container[0] === req.body.repository.repo_name) {
              if (container.length === 1 || container[1] === 'latest') {
                runningContainers.push(containerInfo)
              }
            }
          }
        })

        if (runningContainers.length > 0) {
          log.print(`${runningContainers.length} running container${runningContainers.length !== 1 ? 's' : ''} require${runningContainers.length === 1 ? 's' : ''} an update.`)
          log.print(`Pulling ${req.body.repository.repo_name}:${req.body.push_data.tag}...`)

          docker.pull(`${req.body.repository.repo_name}:${req.body.push_data.tag}`, (err, stream) => {
            docker.modem.followProgress(stream, (err, out) => {
              if (err) {
                log.print(err)
                return email(`ERROR on ${require('os').hostname()}`, `There was a problem updating containers:<br/><br/>${log.html}`)
              }

              // After pull is complete, restart containers
              log.print(out)
              log.print(`Pull complete (${req.body.repository.repo_name}:${req.body.push_data.tag}).`)

              let tasks = new Tasks()

              runningContainers.forEach(runningContainer => {
                tasks.add(next => {
                  let container = docker.getContainer(runningContainer.Id)

                  log.print(`Restarting ${runningContainer.Names[0].replace(/\/{1,10}/gi, '')}`)

                  container.restart({ t: 10 }, err => {
                    if (err) {
                      failedRestarts.push(runningContainer)
                      log.print(err)
                    } else {
                      log.print(`Successfully restarted ${runningContainer.Names[0].replace(/\/{1,10}/gi, '')}`)

                      successfulRestarts.push(runningContainer)
                    }

                    next()
                  })
                })
              })

              tasks.on('complete', () => {
                if (successfulRestarts.length > 0 || failedRestarts.length > 0) {
                  let msg = ''

                  if (successfulRestarts.length > 0) {
                    msg = `Restarted ${successfulRestarts.length} container${successfulRestarts.length !== 1 ? 's' : ''}${successfulRestarts.length > 0 ? ':\n' : '.'}`

                    successfulRestarts.forEach(container => msg += `  - ${container.Names[0].replace(/\/{1,10}/gi, '')} (ID: ${container.Id})`)
                  }

                  if (failedRestarts.length > 0) {
                    msg += `Failed to restart ${failedRestarts.length} container${failedRestarts.length !== 1 ? 's' : ''}${failedRestarts.length > 0 ? ':\n' : '.'}`

                    failedRestarts.forEach(container => msg += `  - ${container.Names[0].replace(/\/{1,10}/gi, '')} (ID: ${container.Id})`)
                  }

                  msg += '\n\n--- COMPLETE LOG ---\n\n' + log.toString()

                  email(`Restarted services on ${require('os').hostname()}`, msg.replace(/\t{1,100}\n/gi, '\n').trim())
                }
              })

              tasks.run()
            })
          })
        }

        res.sendStatus(200)
      })
    },

    container: (req, res) => {
      if (!req.params.name) {
        return res.status(400).send('Invalid request. No container name/id specified.')
      }

      let container = docker.getContainer(req.params.name)
      let log = new Log()

      container.inspect((err, data) => {
        if (err) {
          res.status(404).send(NGN.coalesce(err.reason, err.message))
          return
        }

        log.print(`docker pull ${data.Config.Image}`)
        docker.pull(`${data.Config.Image}`, (pullerr, stream) => {
          docker.modem.followProgress(stream, (followerr, out) => {
            if (followerr) {
              log.print(followerr)
              email(`ERROR on ${require('os').hostname()}`, `There was a problem updating a container (${req.params.name}):<br/><br/>${log.html}`)
            } else {
              log.print(`Pull complete. Restarting ${req.params.name}`)

              container.restart({ t: 10 }, (cerr) => {
                if (cerr) {
                  log.print(cerr)
                  email(`ERROR on ${require('os').hostname()}`, `There was a problem updating a container (${req.params.name}):<br/><br/>${log.html}`)
                } else {
                  email(`Restarted ${req.params.name}`, log.html + '\n\n' + JSON.stringify(out, null, 2).replace(/\n/gi, '<br/>').replace(/\s/gi, '&nbsp;'))
                }
              })
            }
          })
        })

        res.sendStatus(200)
      })
    }
  }
}
