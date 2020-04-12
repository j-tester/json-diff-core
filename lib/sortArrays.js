function sortJSON(data, options = {}) {
  const sortKeys = options.sortKeys || ['id'];

  if (Array.isArray(data)) {
    if (typeof data[0] === 'object') {
      sortKeys.every((key) => {
        if (data[0][key]) {
          data.sort((a, b) => a[key] - b[key]);
          return false;
        }
        return true;
      });
    } else {
      data.sort();
    }
    const arr = [];
    data.forEach((key) => {
      arr.push(sortJSON(key, options));
    });
    return arr;
  }
  if (!data || typeof data !== 'object') return data;
  return Object.keys(data).reduce((acc, key) => {
    acc[key] = sortJSON(data[key], options);
    return acc;
  }, {});
}

module.exports = (data, options) => sortJSON(data, options);
