const mongoose = require('mongoose')

const connect = (cb) => {
  mongoose.connect(`mongodb://${process.env.MLAB_USER}:${process.env.MLAB_PW}@ds125556.mlab.com:25556/opencv4nodejs`)
  const db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error:'))
  db.once('open', cb)
}

const Clazz = mongoose.model('Classes', mongoose.Schema({
  className: { type: String, required: true, unique: true },
  cvModule: { type: String, required: true },
  fields: { type: mongoose.Schema.Types.Mixed, required: true }
}))

const declType = {
  type: { type: String, required: true },
  name: { type: String, required: true },
  defaultValue: { type: String },
  arrayDepth: { type: Number },
  numArrayElements: { type: Number }
}

const fnSchema = new mongoose.Schema({
  fnName: { type: String, required: true },
  cvModule: { type: String, required: true },
  owner: { type: String, required: true },
  hasAsync: { type: Boolean, required: true },
  signatures: [
    {
      returnValues: { type: [declType] },
      optionalArgs: { type: [declType] },
      requiredArgs: { type: [declType] },
      allArgs: { type: String }
    }
  ]
})

fnSchema.index({ fnName: 1, cvModule: 1}, { unique: true })

const Fn = mongoose.model('Functions', fnSchema)


module.exports = {
  Clazz,
  Fn,
  connect
}