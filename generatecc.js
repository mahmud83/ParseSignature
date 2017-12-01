const fs = require('fs');
const parseSignature = require('./src/parseSignature');
const generateWorker = require('./src/generateWorker');

const signature = `
CV_WRAP static Ptr<SIFT> create( int nfeatures = 0, int nOctaveLayers = 3,
  double contrastThreshold = 0.04, double edgeThreshold = 10,
  double sigma = 1.6);
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

