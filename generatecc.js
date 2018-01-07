const fs = require('fs');
const parseSignature = require('./generate-cc/parseSignature');
const generateWorker = require('./generate-cc/generateWorker');

const signature = `
CV_EXPORTS_W void cornerMinEigenVal( InputArray src, OutputArray dst,
  int blockSize, int ksize = 3,
  int borderType = BORDER_DEFAULT );
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

