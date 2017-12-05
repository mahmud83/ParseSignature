const fs = require('fs')
const path = require('path')
const {
  extractRegion,
  extractFunctions,
  getFunctionSignatures,
  parseFunctionSignature
} = require('./parse-md/parsemdtools')
const {
  capitalizeFirst,
  logd
} = require('./tools/utils')

const {
  Clazz,
  Fn,
  connect
} = require('./tools/persist')

const isClassFile = fileName => fileName === capitalizeFirst(fileName)

const cvModule = 'core'
const fileName = 'Mat';
const functionToParse = 'perspectiveTransform'

const owner = isClassFile(fileName) ? fileName : 'cv'

const mdFile = `./data/mdsrc/${fileName}.md`
//const outDir = `./data/signatures/${cvModule}${clazz ? `/${clazz}` : ''}`
const outDir = `./data/signatures`

const lines = fs.readFileSync(mdFile).toString().split('\r\n')


console.log(extractRegion(
  fs.readFileSync(mdFile).toString().split('\r\n'),
  'Constructors'
))




return

const fns = extractFunctions(lines)

const fnsWithSignatures = fns
  .map(fn => Object.assign({}, { cvModule }, { owner }, fn ))
  .map(fn => Object.assign({}, fn, { signatures: getFunctionSignatures(lines, fn.fnName) }))
  .filter(fn => !functionToParse || functionToParse && fn.fnName === functionToParse)
  .map(fn => Object.assign({}, fn, { signatures: fn.signatures.map(parseFunctionSignature) }))

//fnsWithSignatures.forEach(fn => fs.writeFileSync(path.join(outDir, `${fn.name}.json`), JSON.stringify(fn)))

connect(() => {

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

  const makeUpdatePromised = fn => () => new Promise((resolve, reject) => {
    logd('fn')
    logd(fn)

    Fn.findOne({
      fnName: fn.fnName,
      owner: fn.owner
    }, (err, res) => {
      if (err) return reject(err)
      logd('id is', res._id)

      Fn.findByIdAndUpdate(res._id, { $set: fn }, function (err2, doc) {
        if (err2) return reject(err2)
        if (!doc) return reject('error: not found')
        logd('updated doc:')
        logd(doc)
        return resolve(doc)
      })
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