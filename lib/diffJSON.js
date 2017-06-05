const sortArrays = require('./sortArrays');
const detailedDiff = require('deep-object-diff').detailedDiff;
const flatten = require('flat');

module.exports = async (lj, rj, options) => {
  const diffTable = [];
  let leftJSON = sortArrays(lj, options);
  let rightJSON = sortArrays(rj, options);

  let ignore;
  if (options && typeof options.ignore === 'string') {
    ignore = [options.ignore];
  } else if(options) {
    ignore = options.ignore;
  }

  leftJSON = JSON.parse(JSON.stringify(leftJSON), (key, value) => {
    if (ignore && ignore.includes(key)) {
      return undefined;
    }
    return value;
  });

  rightJSON = JSON.parse(JSON.stringify(rightJSON), (key, value) => {
    if (ignore && ignore.includes(key)) {
      return undefined;
    }
    return value;
  });

  const diff = detailedDiff(leftJSON, rightJSON);
  const added = flatten(diff.added);
  const deleted = flatten(diff.deleted);
  const updated = flatten(diff.updated);
  const leftFlatJSON = flatten(leftJSON);

  Object.keys(added).forEach((key) => {
    const value = added[key];
    diffTable.push({
      key,
      left: 'undefined',
      right: value,
      diff: 'added',
    });
  });

  Object.keys(deleted).forEach((key) => {
    const value = leftFlatJSON[key];
    diffTable.push({
      key,
      left: value,
      right: 'undefined',
      diff: 'deleted',
    });
  });

  Object.keys(updated).forEach((key) => {
    const leftValue = leftFlatJSON[key];
    const rightValue = updated[key];
    diffTable.push({
      key,
      left: leftValue,
      right: rightValue,
      diff: 'updated',
    });
  });

  if (diffTable.length === 0) {
    diffTable.push({
      key: 'none',
      left: 'none',
      right: 'none',
      diff: 'none',
    });
  }

  return diffTable;
};
