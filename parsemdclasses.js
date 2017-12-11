const fs = require('fs')
const path = require('path')
const parseConstructors = require('./parse-md/parseConstructors')
const parseFields = require('./parse-md/parseFields')
const {
  extractRegion
} = require('./parse-md/parsemdtools')
const {
  logd
} = require('./tools/utils')

const {
  Clazz,
  connect
} = require('./tools/persist')

const cvModule = 'core'
const fileName = 'RotatedRect';

const className = fileName

const mdFile = `./data/mdsrc/${fileName}.md`
//const outDir = `./data/signatures/${cvModule}${clazz ? `/${clazz}` : ''}`
const outDir = `./data/signatures`

const constructors = parseConstructors(
  extractRegion(
    fs.readFileSync(mdFile).toString().split('\r\n'),
    'Constructors'
  ),
  className
)


const fields = parseFields(
  extractRegion(
    fs.readFileSync(mdFile).toString().split('\r\n'),
    'Accessors'
  )
)

logd(constructors.map(c => JSON.stringify(c)))
logd(fields.map(f => JSON.stringify(f)))

const clazz = {
  className,
  cvModule,
  fields,
  constructors
}
logd('clazz')
logd(clazz)

const clazzObject = new Clazz(clazz)

logd('clazzObject')
logd(clazzObject)

connect(() => {
  create()
})

const create = () => {
  clazzObject.save((err, res) => {
    if (err) {
      throw new Error(err)
    }
    logd(res)
    logd('done')
  })
}

const update = () => {
  Clazz.findOne({
    className,
  }, (err, res) => {
    if (err) {
      throw new Error(err)
    }
    logd('id is', res._id)

    Clazz.findByIdAndUpdate(res._id, { $set: clazz }, function (err2, doc) {
      if (err2) {
        throw new Error(err2)
      }
      if (!doc) {
        throw new Error('error: not found')
      }
      logd('updated doc:')
      logd(doc)
      logd('done')
    })
  })
}
