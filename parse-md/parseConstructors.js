const { logd } = require('../tools/utils')

const makeConstructorRegex = className => new RegExp(`new ${className}\\(.*\\)`)

module.exports = (lines, className) => {
  const regex = makeConstructorRegex(className)
  const constructorSignatures = lines.filter(l => regex.test(l))
}