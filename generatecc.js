const fs = require('fs');
const parseSignature = require('./generate-cc/parseSignature');
const generateWorker = require('./generate-cc/generateWorker');

const signature = `
CV_EXPORTS_W void transform(InputArray src, OutputArray dst, InputArray m )
`
const signatureJSON = parseSignature(signature);

console.log(signatureJSON);

const gen = generateWorker(
  {
    //namespace: 'Calib3d',
    namespace: 'Mat', self: 'cv::Mat', isClassMethod: true
  },
  signatureJSON
);

console.log(gen);

const file = `./data/generatedcc/${signatureJSON.name}.cc`;
console.log(file);
fs.writeFileSync(file, gen.join('\r\n'))

