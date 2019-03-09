const request = require('superagent');

module.exports = async (message, notifications) => {
  console.log(message);

  return;

  if (notifications.slack) {
    await request.post(notifications.slack.channelWebhookURL).set('Content-type', 'application/json').send({
      text: message,
      username: notifications.slack.username,
    });
  }
};
