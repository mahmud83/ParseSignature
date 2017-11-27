const fs = require('fs');
const parseSignature = require('./src/parseSignature');
const generateWorker = require('./src/generateWorker');

const signature = `
CV_EXPORTS_W void Rodrigues( InputArray src, OutputArray dst, OutputArray jacobian = noArray() );
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

const file = `generatedcc/${signatureJSON.name}.cc`;
console.log(file);
fs.writeFileSync(file, gen.join('\r\n'))

