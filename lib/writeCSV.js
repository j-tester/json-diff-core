const csv = require('fast-csv');

module.exports = (outputPath, table) => {
  const data = [];
  data.push(['id', 'left url', 'left response time', 'right url', 'right response time', 'key', 'left value', 'right value', 'difference', 'status']);

  table.forEach((row) => {
    const id = row.id || 0;
    const leftURL = row.leftURL;
    const rightURL = row.rightURL;
    const leftResponseTime = row.leftResponseTime || 'unknown';
    const rightResponseTime = row.rightResponseTime || 'unknown';
    const key = row.key || 'none';
    const left = row.left || 'none';
    const right = row.right || 'none';
    const diff = row.diff || 'unknown';
    const status = row.status || 'fail';
    data.push([
      id,
      leftURL,
      leftResponseTime,
      rightURL,
      rightResponseTime,
      key,
      left,
      right,
      diff,
      status,
    ]);
  });

  return new Promise((resolve, reject) => {
    csv
    .writeToPath(outputPath, data, { headers: true })
    .on('finish', () => {
      resolve();
    })
    .on('error', (err) => {
      reject(err);
    });
  });
};
