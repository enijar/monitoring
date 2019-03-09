const getStatus = require('./getStatus');

module.exports = async url => {
  return await getStatus(url);
};
