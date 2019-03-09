const request = require('superagent');
const config = require('../../config');

module.exports = url => new Promise(async resolve => {
  if (!url) {
    console.error('URL not specified');
    resolve(null);
  }

  if (!url.startsWith('https://')) {
    console.error('No HTTPS');
    return resolve(null);
  }

  const info = {
    issuer: null,
    expireTime: null,
  };

  try {
    const {res} = await request.head(url).timeout({response: config.requestTimeout});
    const {valid_to, issuer} = res.connection.getPeerCertificate();
    info.issuer = issuer.O || null;
    info.expireTime = new Date(valid_to).getTime();
  } catch (err) {
    console.error(err.message);
  }

  resolve(info);
});
