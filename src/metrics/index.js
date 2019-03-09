module.exports = async url => {
  return {
    ssl: await require('./ssl')(url),
    status: await require('./status')(url),
  };
};
