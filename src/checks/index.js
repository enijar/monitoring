const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const getErrorMessage = (metric, check, results, data) => {
  if (metric === 'status' && !results.statusOk) {
    return `${check.url} is down`;
  }

  if (metric === 'status' && !results.withinMaxResponseTime) {
    return `${check.url} took a long time to load (${data.status.status}ms)`;
  }

  if (metric === 'ssl' && !results.sslValid) {
    return `${check.url} SSL has expired (${results.sslExpiryDate})`;
  }

  return '';
};

module.exports = (check, data) => {
  const results = {};
  const sslCheck = check.url.startsWith('https://');

  if (check.hasOwnProperty('status')) {
    results.statusOk = check.status === data.status.status;
    results.withinMaxResponseTime = data.status.responseTime < check.maxResponseTime;
  }

  if (sslCheck) {
    const date = new Date(data.ssl.expireTime);
    results.sslValid = data.ssl && data.ssl.expireTime - Date.now() > 0;
    results.sslExpiryDate = data.ssl && `${MONTHS[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
  }

  return {
    ssl: sslCheck ? null : {
      ok: results.sslValid,
      errorMessage: getErrorMessage('ssl', check, results, data),
      okMessage: `${check.url} SSL is now valid`,
    },
    status: {
      ok: results.statusOk && results.withinMaxResponseTime,
      errorMessage: getErrorMessage('status', check, results, data),
      okMessage: `${check.url} is OK`,
    },
  };
};
