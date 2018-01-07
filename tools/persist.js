const mongoose = require('mongoose')

const connect = (cb) => {
  mongoose.connect(`mongodb://${process.env.MLAB_USER}:${process.env.MLAB_PW}@ds125556.mlab.com:25556/opencv4nodejs`)
  const db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error:'))
  db.once('open', cb)
}

const declType = {
  type: { type: String, required: true },
  name: { type: String, required: true },
  arrayDepth: { type: Number },
  numArrayElements: { type: Number }
}

const fieldDeclType = Object.assign({}, declType, {
  forClassesOnly: { type: [String] }
})

const argType =  Object.assign({}, declType, {
  defaultValue: { type: String }
})

const clazzSchema = new mongoose.Schema({
  className: { type: String, required: true, unique: true },
  cvModule: { type: String, required: true },
  fields: [declType],
  constructors: {
    type: [{
      optionalArgs: { type: [argType] },
      requiredArgs: { type: [argType] },
      returnsOther: String
    }]
  }
})

clazzSchema.index({ className: 1 }, { unique: true })

const Clazz = mongoose.model('Classes', clazzSchema)

const fnSchema = new mongoose.Schema({
  fnName: { type: String, required: true },
  cvModule: { type: String, required: true },
  owner: { type: String, required: true },
  hasAsync: { type: Boolean, required: true },
  category: { type: String },
  signatures: [
    {
      returnValues: { type: [argType] },
      optionalArgs: { type: [argType] },
      requiredArgs: { type: [argType] },
      allArgs: { type: String }
    }
  ]
})

fnSchema.index({ fnName: 1, owner: 1 }, { unique: true })

const Fn = mongoose.model('Functions', fnSchema)


module.exports = {
  Clazz,
  Fn,
  connect
}