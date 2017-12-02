const fs = require('fs')
const path = require('path')
const {
  extractFunctions,
  getFunctionSignatures,
  parseFunctionSignature
} = require('./src/parsemdtools')
const {
  capitalizeFirst,
  logd
} = require('./src/utils')

const {
  Clazz,
  Fn,
  connect
} = require('./src/persist')

const isClassFile = fileName => fileName === capitalizeFirst(fileName)

const cvModule = 'core'
const fileName = 'core';
const functionToParse  = 'kmeans'

const owner = isClassFile(fileName) ? fileName : 'cv'

const mdFile = `./mdsrc/${fileName}.md`
//const outDir = `./signatures/${cvModule}${clazz ? `/${clazz}` : ''}`
const outDir = `./signatures`

connect(() => {

  const lines = fs.readFileSync(mdFile).toString().split('\r\n')

  const fns = extractFunctions(lines)

  const fnsWithSignatures = fns
    .map(fn => Object.assign({}, { cvModule }, { owner }, fn ))
    .map(fn => Object.assign({}, fn, { signatures: getFunctionSignatures(lines, fn.fnName) }))
    .filter(fn => !functionToParse || functionToParse && fn.fnName === functionToParse)
    .map(fn => Object.assign({}, fn, { signatures: fn.signatures.map(parseFunctionSignature) }))

  //fnsWithSignatures.forEach(fn => fs.writeFileSync(path.join(outDir, `${fn.name}.json`), JSON.stringify(fn)))

  const makeSavePromised = fn => () => new Promise((resolve, reject) => {

    logd('fn')
    logd(fn)

    const fnObject = new Fn(fn)

    logd('fnObject')
    logd(fnObject)

    fnObject.save((err, res) => {
      if (err) return reject(err)
      return resolve(res)
    })
  })

  const thenNext = (promises, curr = 0) => {
    if (curr < promises.length)
      return promises[curr]()
        .then(() => thenNext(promises, curr + 1))

    return Promise.resolve('done')
  }

  thenNext(fnsWithSignatures.map(fn => makeSavePromised(fn)))
    .then(res => console.log(res))
    .catch(err => console.error(err))

})