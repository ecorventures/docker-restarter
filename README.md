# Restarter

Automatically restarts systemd processes. Also capable of deploying to Firebase.

## Running

```sh
docker run -d \
  --name restarter \
  --privileged
  -e "USERNAME=webhookBasicAuthUsername" \
  -e "PASSWORD=webhookBasicAuthPassword" \
  -e "SMTP_SERVICE=gmail" \
  -e "SMTP_USERNAME=me@mydomain.com" \
  -e "SMTP_PASSWORD=XXXXX" \
  -e "NOTIFICATION_SENDER=me@mydomain.com" \
  -e "NOTIFICATION_RECIPIENT=notify@someone.com" \
  -p 3000:80 \
  ecor/restarter
```

## env vars

- `DEBUG` (Boolean)
- `USERNAME` (string) A basic auth username
- `PASSWORD` (string) A basic auth password
- `DEPLOY_COMMAND` (string) - a command, like `npm run deploy`
- `SMTP_HOST` (string)
- `SMTP_PORT` (defaults to 587)
- `SMTP_USER` (string)
- `SMTP_PASSWORD` (string)
- `SMTP_SERVICE` (string) - example `gmail`
- `NOTIFICATION_SENDER` (string) - email address of the sender.
- `NOTIFICATION_RECIPIENT` (string) - email address where notification should be sent.
