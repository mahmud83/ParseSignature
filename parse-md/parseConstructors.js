const { logd } = require('../tools/utils')
const {
  parseArgs
} = require('./parseFunctionSignature')

const makeConstructorRegex = className => new RegExp(`new ${className}\\(.*\\)`)

module.exports = (lines, className) => {
  if (!lines.length) throw new Error('lines empty')
  if (!className) throw new Error('className required')

  logd('parsing constructors from lines:')
  logd(lines)

  const regex = makeConstructorRegex(className)
  const constructorSignatures = lines.filter(l => regex.test(l))
  logd('constructorSignatures')
  logd(constructorSignatures)

  const signatures = constructorSignatures
    .map(s => {
      const returnValue = s.split(':')[0].trim()
      return Object.assign({}, parseArgs(s), returnValue !== className ? { returnsOther: returnValue } : {})
    })

  return signatures
}