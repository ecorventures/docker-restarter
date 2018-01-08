# Restarter

Automatically restarts systemd processes. Also capable of deploying to Firebase.

## env vars

- `DEBUG` (Boolean)
- `USERNAME` (string) A basic auth username
- `PASSWORD` (string) A basic auth password
- `DEPLOY_COMMAND` (string) - a command, like `npm run deploy`
- `SMTP_HOST` (string)
- `SMTP_PORT` (defaults to 25)
- `SMTP_USER` (string)
- `SMTP_PASSWORD` (string)
- `SMTP_SERVICE` (string) - example `gmail`
- `NOTIFICATION_RECIPIENT` (string) - email address where notification should be sent.
