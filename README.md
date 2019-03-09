# Monitoring 🤖

Basic website SSL and uptime monitoring.

### Getting Started

Setup `checks.json` file.

```bash
cp checks.example.json checks.json
```

### Setup Slack Notifications

Add a [webhook configuration](https://phillipcraig.slack.com/apps/A0F7XDUAZ-incoming-webhooks) to your workspace, then
add the URL to the slack notification object `channelWebhookURL`.

### Running

```bash
npm start
```
