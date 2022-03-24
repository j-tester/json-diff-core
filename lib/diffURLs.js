const Axios = require('axios');
const https = require('https');
const diffJSON = require('./diffJSON');

let axios = Axios;

module.exports = async (leftURL, rightURL, opts) => {
  const options = {};
  options.method = opts.method || 'GET';
  options.timeout = opts.timeout || 5000;
  options.headers = opts.headers || [];
  options.body = opts.body || {};
  options.sortKey = opts.sortKey;
  options.sortKeys = opts.sortKeys || [];
  options.ignore = opts.ignore || [];
  options.skipcertificate = opts.skipcertificate || false;
  options.expectedStatusCode = opts.expectedStatusCode ? [opts.expectedStatusCode] : [200, 201, 202, 203, 204, 205, 206, 207, 208, 209];
  options.customDiff = opts.customDiff || {};
  options.customCompare = opts.customCompare || {};

  if (options.sortKey) {
    options.sortKeys.unshift(options.sortKey);
  }
  options.sortKeys.push('id');

  if (options.skipcertificate) {
    axios = Axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });
  }

  if (!Array.isArray(options.headers)) {
    options.headers = [options.headers];
  }
  const headers = {};
  options.headers.forEach((string) => {
    const head = string.split(':');
    headers[head[0].toString()] = head[1];
  });

  const config = {
    headers,
    timeout: options.timeout,
    validateStatus() {
      return true;
    },
  };

  let leftResponse;
  let rightResponse;
  let leftResponseTime;
  let rightResponseTime;

  if (options.method.toUpperCase() === 'GET') {
    try {
      const url1Start = Date.now();
      leftResponse = await axios.get(leftURL, config);
      leftResponseTime = Date.now() - url1Start;
      const url2Start = Date.now();
      rightResponse = await axios.get(rightURL, config);
      rightResponseTime = Date.now() - url2Start;
    } catch (err) {
      err.leftURL = leftURL;
      err.rightURL = rightURL;
      throw err;
    }
  } else if (options.method.toUpperCase() === 'POST') {
    try {
      const url1Start = Date.now();
      leftResponse = await axios.post(leftURL, options.body, config);
      leftResponseTime = Date.now() - url1Start;
      const url2Start = Date.now();
      rightResponse = await axios.post(rightURL, options.body, config);
      rightResponseTime = Date.now() - url2Start;
    } catch (err) {
      err.leftURL = leftURL;
      err.rightURL = rightURL;
      throw err;
    }
  } else if (options.method.toUpperCase() === 'DELETE') {
    try {
      const url1Start = Date.now();
      leftResponse = await axios.delete(leftURL, config);
      leftResponseTime = Date.now() - url1Start;
      const url2Start = Date.now();
      rightResponse = await axios.delete(rightURL, config);
      rightResponseTime = Date.now() - url2Start;
    } catch (err) {
      err.leftURL = leftURL;
      err.rightURL = rightURL;
      throw err;
    }
  } else {
    throw new Error('Unsupported method');
  }

  const leftJSON = leftResponse.data;
  const rightJSON = rightResponse.data;

  const arr = [];
  const ls = leftResponse.status;
  const rs = rightResponse.status;
  if (!options.expectedStatusCode.includes(ls) || !options.expectedStatusCode.includes(rs)) {
    arr.push({
      key: '__statusCode',
      left: ls,
      right: rs,
      diff: `expected: [${options.expectedStatusCode}]`,
    });
  }

  const diff = await diffJSON(leftJSON, rightJSON, options, arr);

  return {
    leftResponseTime,
    rightResponseTime,
    leftURL,
    rightURL,
    differences: diff,
    leftHeaders: leftResponse.headers,
    rightHeaders: rightResponse.headers,
  };
};
