const fs = require('fs')
const path = require('path')
const {
  extractFunctions,
  getFunctionSignatures,
  parseFunctionSignature
} = require('./src/parsemdtools')


const cvModule = 'core'
const clazz = ''
const mdFile = `./mdsrc/core.md`
//const outDir = `./signatures/${cvModule}${clazz ? `/${clazz}` : ''}`
const outDir = `./signatures`

const lines = fs.readFileSync(mdFile).toString().split('\r\n')

const fns = extractFunctions(lines)

const fnsWithSignatures = fns
  .map(fn => Object.assign({}, { cvModule }, clazz ? { clazz } : {}, fn ))
  .map(fn => Object.assign({}, fn, { signatures: getFunctionSignatures(lines, fn.name) }))
  .map(fn => Object.assign({}, fn, { signatures: fn.signatures.map(signature => JSON.stringify(parseFunctionSignature(signature))) }))
console.log(fnsWithSignatures)

fnsWithSignatures.forEach(fn => fs.writeFileSync(path.join(outDir, `${fn.name}.json`), JSON.stringify(fn)))