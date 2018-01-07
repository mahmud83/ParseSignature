const { logd } = require('../tools/utils')
const { getDeclaration } = require('./parseFunctionSignature')

const fieldRegex = /.+\s*:\s*.+/

module.exports = (lines) => {
  if (!lines.length) throw new Error('lines empty')

  logd('parsing fields from lines:')
  logd(lines)

  const declarations = lines
    .filter(l => fieldRegex.test(l))
    .map(l => l.replace(',', ''))
    .map(l => l.trim())
  logd('declarations')
  logd(declarations)

  return declarations.map((decl) => {
    const [name, other] = decl
      .split(':')
      .map(el => el.trim())
    const [type, forClassesOnlyString] = other
      .split('(')
      .map(el => el.trim())

    return Object.assign(
      {},
      getDeclaration(type, name),
      forClassesOnlyString
        ? { forClassesOnly: forClassesOnlyString.substr(0, forClassesOnlyString.indexOf(')')).split(',').map(el => el.trim()) }
        : {}
    )
  })
}