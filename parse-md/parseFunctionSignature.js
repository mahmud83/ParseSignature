const { lowercaseFirst, splitLast, isUint, logd } = require('../tools/utils')

const flatTypes = ['Uchar', 'Char', 'Uint', 'Int', 'Number', 'String', 'Boolean']

const transfromIfFlatType = type => flatTypes.some(t => t === type) ? lowercaseFirst(type) : type

const getDeclaration = (typeString, name) => {
  logd('getDeclaration for')
  logd('typeString:', typeString)
  logd('name:', name)

  if (!typeString || !name) {
    throw new Error(`getDeclaration invalid arguments: typeString '${typeString}', name '${name}'`)
  }

  const arrayDepth = (typeString.match(/\[/g) || []).length
  if (arrayDepth !== (typeString.match(/\]/g) || []).length) {
    throw new Error(`invalid arrayDepth '${arrayDepth}' for typeString '${typeString}'`)
  }

  const pieces = typeString.replace(/\[/g, '').replace(/\]/g, '').trim().split(' ')

  const decl = arrayDepth ? { arrayDepth, name } : { name }

  let type
  if (pieces.length > 1) {
    decl.numArrayElements = pieces[0]
    if (!isUint(decl.numArrayElements)) {
      throw new Error(`invalid numArrayElements: '${decl.numArrayElements}'`)
    }
    type = pieces[1]
  } else {
    type = pieces[0]
  }

  if (pieces.length > 2 || !type) {
    throw new Error(`invalid typeString '${typeString}', pieces: '${pieces.join(', ')}'`)
  }

  decl.type = transfromIfFlatType(type)

  logd('declaration is:', decl)
  return decl
}

const getReturnValuesString = (signatureString) => {
  const idx = signatureString.trim().startsWith('{')
    ? signatureString.lastIndexOf('}')
    : signatureString.indexOf(':')

  if (idx === -1) return null

  return signatureString
    .substr(0, idx)
    .trim()
    .replace('{', '')
    .replace('}', '')
}

const parseReturnValues = (returnValuesString) => {
  let returnValues = returnValuesString.split(',')

  logd('parsing return values:', returnValues)

  if (returnValues.length === 1 && !/\:/.test(returnValues)) {
    return [getDeclaration(returnValues[0], 'returnValue')]
  }

  return returnValues.map(
    nameAndType => nameAndType
      .split(':')
      .map(el => el.trim())
      .reduce((name, type) => getDeclaration(type, name || 'returnValue'))
  )
}

const replaceInnerSignatureCommas = (argsString, replaceWith) => {
  let strCopy = ''
  let up = false
  for (let i in argsString) {
    const c = argsString[i]
    if (c === '(') up = true
    if (c === ')') up = false
    if (up && c === ',') {
      strCopy += replaceWith
    } else {
      strCopy += c
    }
  }
  return strCopy
}

const parseFunctionDeclaration = (decl) => {
  const signature = parseFunctionSignature(decl)
  const tmp = decl.substr(0, decl.indexOf('(')).split(' ')
  return ({
    type: 'func',
    name: tmp[tmp.length - 1],
    signature
  })
}

const parseDeclaration = (decl) => {
  if (decl.includes(':')) {
    return parseFunctionDeclaration(decl)
  }

  const [type, name] = splitLast(decl.trim(), ' ').map(s => s.trim())
  return getDeclaration(type, name)
}

const getArgsStrings = signatureString => {
  const openingBracketIdx = signatureString.indexOf('(')
  const closingBracketIdx = signatureString.lastIndexOf(')')
  const argsString = signatureString.substr(openingBracketIdx + 1, closingBracketIdx - openingBracketIdx - 1)

  logd('argsString:', argsString)

  return replaceInnerSignatureCommas(argsString, ';')
    .split(',')
    .map(s => s.replace(';', ','))
}

const parseArgs = (signatureString) => {
  const argStrings = getArgsStrings(signatureString)
  logd('argument strings:', argStrings)

  const optionalArgs = argStrings
    .filter(s => s.includes('='))
    .map((s) => {
      const [declaration, defaultValue] = s.split('=').map(s => s.trim())
      return Object.assign({}, parseDeclaration(declaration), { defaultValue })
    })

  let requiredArgs = []
  if (argStrings.some(s => s !== '')) {
    requiredArgs = argStrings
      .filter(s => !s.includes('='))
      .map(s => parseDeclaration(s.trim()))
  }

  return ({
    optionalArgs,
    requiredArgs
  })
}

const parseFunctionSignature = (signatureString) => {
  logd('parsing signature:', signatureString)

  const returnValuesString = getReturnValuesString(signatureString)

  logd('returnValuesString:', returnValuesString)

  const returnValues = returnValuesString
    ? parseReturnValues(returnValuesString)
    : null

  logd('returnValues (%s) are: %s', (returnValues || []).length, JSON.stringify(returnValues))

  const {
    optionalArgs,
    requiredArgs
  } = parseArgs(signatureString)

  logd('optionalArgs (%s) are: %s', optionalArgs.length, JSON.stringify(optionalArgs))
  logd('requiredArgs (%s) are: %s', requiredArgs.length, JSON.stringify(requiredArgs))

  const allArgs = optionalArgs
    .concat(requiredArgs)
    .map(arg => arg.name)

  logd('allArgs (%s) are: %s', allArgs.length, allArgs)
  logd('---------------------------------------------')
  logd('')

  return ({
    returnValues,
    allArgs,
    requiredArgs,
    optionalArgs
  })
}

module.exports = {
  getDeclaration,
  parseArgs,
  parseFunctionSignature
}