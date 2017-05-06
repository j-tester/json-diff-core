const fs = require('fs');
const json2csv = require('json2csv');

module.exports = (outputPath, table) => {
  const fields = [
    'id',
    {
      label: 'url1',
      value: 'leftURL',
    },
    {
      label: 'url1 response time',
      value: 'leftResponseTime',
    },
    {
      label: 'url2',
      value: 'rightURL',
    },
    {
      label: 'url2 response time',
      value: 'rightResponseTime',
    },
    'key',
    {
      label: 'url1 value',
      value: 'left',
    },
    {
      label: 'url2 value',
      value: 'right',
    },
    {
      label: 'difference',
      value: 'diff',
    },
    'status',
  ];

  const result = json2csv({ fields, data: table });
  fs.writeFileSync(outputPath, result);
};
