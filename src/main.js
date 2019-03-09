const fs = require('fs');
const path = require('path');
const metrics = require('./metrics/index');
const checks = require('./checks/index');
const notify = require('./notify/index');

const STATE = {
  checked: {},
};

(function main () {
  const checksFile = path.resolve(__dirname, '..', 'checks.json');

  if (!fs.existsSync(checksFile)) {
    return console.error(`No checks.json file in ${checksFile}`);
  }

  let requests = [];
  let notifications = {};
  try {
    const json = JSON.parse(fs.readFileSync(checksFile, 'utf8'));
    requests = json.requests;
    notifications = json.notifications;
  } catch (err) {
    console.error(err.message);
    return setTimeout(main, 1000);
  }

  let processed = 0;

  requests.forEach(async request => {
    if (!STATE.checked.hasOwnProperty(request.url)) {
      STATE.checked[request.url] = {};
    }

    // Wait until check interval has passed before checking again.
    if (
      STATE.checked[request.url].hasOwnProperty('checkTime') &&
      Date.now() - STATE.checked[request.url].checkTime < request.interval
    ) {
      if (++processed === requests.length) {
        setTimeout(main, 1000);
      }
      return;
    }

    let data = {};

    try {
      data = await metrics(request.url);
    } catch (err) {
      console.error(err.message);
    }

    const result = checks(request, data);

    STATE.checked[request.url].checkTime = Date.now();

    if (!STATE.checked[request.url].hasOwnProperty('notifications')) {
      STATE.checked[request.url].notifications = {};
    }

    if (!STATE.checked[request.url].notifications.hasOwnProperty('ssl')) {
      STATE.checked[request.url].notifications.ssl = {
        ok: true,
      };
    }

    if (!STATE.checked[request.url].notifications.hasOwnProperty('status')) {
      STATE.checked[request.url].notifications.status = {
        ok: true,
      };
    }

    // If error notification was sent, don't send again until after
    // success notification is sent and another error occurs.
    if (result.ssl) {
      if (!result.ssl.ok && STATE.checked[request.url].notifications.status.ok) {
        try {
          await notify(result.ssl.errorMessage, notifications);
        } catch (err) {
          console.error(err.message);
        }
      }

      if (result.ssl.ok && !STATE.checked[request.url].notifications.status.ok) {
        try {
          await notify(result.ssl.okMessage, notifications);
        } catch (err) {
          console.error(err.message);
        }
      }

      STATE.checked[request.url].notifications.status.ok = result.ssl.ok;
    }

    if (result.status) {
      if (!result.status.ok && STATE.checked[request.url].notifications.status.ok) {
        try {
          await notify(result.status.errorMessage, notifications);
        } catch (err) {
          console.error(err);
        }
      }

      if (result.status.ok && !STATE.checked[request.url].notifications.status.ok) {
        try {
          await notify(result.status.okMessage, notifications);
        } catch (err) {
          console.error(err);
        }
      }

      STATE.checked[request.url].notifications.status.ok = result.status.ok;
    }

    if (++processed === requests.length) {
      setTimeout(main, 1000);
    }
  });
})();
