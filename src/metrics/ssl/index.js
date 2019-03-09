const getCert = require('./getCert');

module.exports = async url => {
  return await getCert(url);
};
