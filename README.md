# Restarter

Automatically restart systemd processes & Docker containers in response to a webhook.

This was designed primarily for the purpose of handling webhooks from [Docker Hub](https://hub.docker.com).

## API Endpoints

The following endpoints can optionally be secured with basic authentication. See the "Running" section for details.

### Ping `GET /ping`

A simple request to make sure the server is running.

### Docker Image Update `POST /image`

This endpoint **requires** a [Docker webhook payload](https://docs.docker.com/docker-hub/webhooks/) (HTTP request body).
It will automatically run a `docker pull` to acquire the new image on the server. Finally,
it will restart every container that uses the image.

### Docker Single Container Update (Named Container) `POST /container/{{name}}`

This endpoint does **not** require a payload (HTTP request body). When called,
the API will look the container up by name (or ID). If the container does not
exist, a `404` response will be sent. If the container exists, Docker will
attempt to pull an updated version of the image associated with the container,
then restart the container.

### Restart Named Service `POST /service/{{name}}`

When received, this will execute the `SERVICE_RESTART_COMMAND` (see below). By default,
this is `systemctl restart {{name}}`. For example, to restart a service named "myservice":

`POST http://mydomain.com:3000/service/myservice` will execute `systemctl restart myservice`.

## Running

This must run as a privileged container in order to access the local docker engine.
The hostname (`-h`) is used to identify the server when sending email notifications.
If no hostname is specified, Docker will generate an ugly one for you, like `2810d65496a4`.

```sh
docker run -d \
  -h my.domain.com \
  --name restarter \
  --privileged
  -e "USERNAME=user" \
  -e "PASSWORD=pass" \
  -e "SMTP_HOST=smtp.gmail.com" \
  -e "SMTP_USERNAME=me@mydomain.com" \
  -e "SMTP_PASSWORD=XXXXX" \
  -e "NOTIFICATION_SENDER=me@mydomain.com" \
  -e "NOTIFICATION_RECIPIENT=notify@someone.com" \
  -p 3000:80 \
  ecor/restarter
```

With this configuration, the service should be available at `http://user:pass@my.domain.com:3000`.
Remember to open the firewall for your specified port (i.e. `3000`). Setting up a TLS/SSL
proxy/terminator in front of this service is recommended since basic auth is only a thin
layer of security.

## env vars

- `DEBUG` (Boolean)
- `USERNAME` (string) A basic auth username
- `PASSWORD` (string) A basic auth password
- `DEPLOY_COMMAND` (string) - a command, like `npm run deploy`
- `SERVICE_RESTART_COMMAND` (string) - a command to restart a service, like `systemctl restart {{name}}` (name is replaced with the name of the service).
- `SMTP_HOST` (string)
- `SMTP_PORT` (defaults to 587) - Secure ports supported.
- `SMTP_USER` (string)
- `SMTP_PASSWORD` (string)
- `NOTIFICATION_SENDER` (string) - email address of the sender.
- `NOTIFICATION_RECIPIENT` (string) - email address where notification should be sent.

## Using Gmail

To use gmail, set the minimum following SMTP environment variables:

- `SMTP_HOST=smtp.gmail.com`
- `SMTP_USER=admin@mydomain.com`
- `SMTP_PASSWORD=password`
- `NOTIFICATION_SENDER=admin@mydomain.com`
