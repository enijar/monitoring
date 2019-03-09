const request = require('superagent');

module.exports = async (message, notifications) => {
  if (notifications.slack) {
    try {
      await request.post(notifications.slack.channelWebhookURL).set('Content-type', 'application/json').send({
        text: message,
        username: notifications.slack.username,
      });
    } catch (err) {
      console.error(err.message);
    }
  }
};
