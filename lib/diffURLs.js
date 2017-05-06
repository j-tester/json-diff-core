const axios = require('axios');
const diffJSON = require('./diffJSON');

module.exports = async (leftURL, rightURL, opts) => {
  const options = {};
  options.method = opts.method || 'GET';
  options.timeout = opts.timeout || 5000;
  options.headers = opts.headers || [];
  options.body = opts.body || [];
  options.sortKey = opts.sortkey || 'id';

  if (!Array.isArray(options.headers)) {
    options.headers = [options.headers];
  }
  const headers = {};
  options.headers.forEach((string) => {
    const head = string.split(':');
    headers[head[0].toString()] = head[1];
  });

  if (!Array.isArray(options.body)) {
    options.body = [options.body];
  }
  const body = {};
  options.body.forEach((string) => {
    const bod = string.split(':');
    body[bod[0].toString()] = bod[1];
  });

  const config = {
    headers,
    timeout: options.timeout,
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
      leftResponse = await axios.post(leftURL, body, config);
      leftResponseTime = Date.now() - url1Start;
      const url2Start = Date.now();
      rightResponse = await axios.post(rightURL, body, config);
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
  const diff = await diffJSON(leftJSON, rightJSON, options);

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
