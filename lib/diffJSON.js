const sortArrays = require('./sortArrays');
const detailedDiff = require('deep-object-diff').detailedDiff;
const flatten = require('flat');

const runCompare = (li, ri, comparison) => {
  let left = li;
  let right = ri;
  const splitCompare = comparison.split('($)').filter(x => x);

  for (const substr of splitCompare) { // eslint-disable-line
    if (!substr.includes('*')) {
      throw new Error('missing * in customCompare');
    }
    const [l, r] = substr.split('*');
    const lm = left.substr(0, left.indexOf(l));
    const rm = right.substr(0, right.indexOf(l));
    if (lm !== rm) {
      return false;
    }
    left = left.substr(left.indexOf(r));
    right = right.substr(right.indexOf(r));
  }

  if (left !== right) {
    return false;
  }

  return true;
};

module.exports = async (lj, rj, options, arr = []) => {
  const diffTable = arr;
  let leftJSON = sortArrays(lj, options);
  let rightJSON = sortArrays(rj, options);

  let ignore = [];
  if (options && typeof options.ignore === 'string') {
    ignore = [options.ignore];
  } else if (options) {
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
    if (ignore.includes(key)) return;
    const value = added[key];
    diffTable.push({
      key,
      left: 'undefined',
      right: value,
      diff: 'added',
    });
  });

  Object.keys(deleted).forEach((key) => {
    if (ignore.includes(key)) return;
    const value = leftFlatJSON[key];
    diffTable.push({
      key,
      left: value,
      right: 'undefined',
      diff: 'deleted',
    });
  });

  Object.keys(updated).forEach((key) => {
    if (ignore.includes(key)) return;
    const leftValue = leftFlatJSON[key];
    const rightValue = updated[key];
    if (options.customDiff && options.customDiff[key]) {
      const re = new RegExp(options.customDiff[key]);
      if (re.test(leftValue) && re.test(rightValue)) {
        return;
      }
    }
    if (options.customCompare && options.customCompare[key]) {
      if (runCompare(leftValue, rightValue, options.customCompare[key])) return;
    }
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
