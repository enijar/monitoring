const request = require('superagent');
const config = require('../../config');

module.exports = url => new Promise(async resolve => {
  const startTime = Date.now();
  let res = {};

  try {
    res = await request.get(url).timeout({response: config.requestTimeout});
  } catch (err) {
    console.error(err.message);
  }

  resolve({
    status: res.statusCode,
    responseTime: Date.now() - startTime,
  });
});
