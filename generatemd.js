//TBD

const generateMd = (fnWithSignature) => {
  const {
    name,
    allArgs,
    requiredArgs,
    optionalArgs,
    returnValues
  } = fnWithSignature;

  const identity = str => str
  const wrapWithCurlyBrackets = str => `{ ${str} }`
  const wrap = !!returnValues && returnValues.length > 1 ? wrapWithCurlyBrackets : identity

  const returnValueString = !!returnValues
    ? `${wrap(`${returnValues.map(r => `${r.name}: ${r.type}`).join(',')}`)} : `
    : '';

}