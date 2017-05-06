module.exports = (json, options) => {
  let sortedJSON = {};
  sortedJSON = JSON.parse(JSON.stringify(json), (key, value) => {
    if (Array.isArray(value)) {
      if (typeof value[0] === 'object' && options.sortKey) {
        value.sort((a, b) => a[options.sortKey] - b[options.sortKey]);
      } else if (typeof value[0] === 'object' && value[0].id) {
        value.sort((a, b) => a.id - b.id);
      }
      return value.sort();
    }
    return value;
  });

  return sortedJSON;
};
