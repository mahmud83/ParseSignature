const { lowercaseFirst, splitLast, isUint } = require('./utils')

const mdh3 = '###'
const asyncIdentifier = 'Async'
const makeDeclarationRegex = fn => new RegExp(`(\.|\s)${fn}\\(.*\\)`)

const extractFunctions = (lines) => {
  const syncAndAsyncFns = lines
    .filter(l => l.includes(mdh3))
    .map(l => l.replace(mdh3, '').trim().split(' ')[0])

  const hasAsyncFn = new Set(
    syncAndAsyncFns
      .filter(fn => fn.includes(asyncIdentifier))
      .map(fn => fn.replace('Async', ''))
  )

  const fns = syncAndAsyncFns
    .filter(fn => !fn.includes(asyncIdentifier))
    .map(fn => ({ name: fn, hasAsync: hasAsyncFn.has(fn) }))

  return fns
}

exports.extractFunctions = extractFunctions

const getFunctionSignatures = (lines, fn) => {
  return lines
    .filter(l => l.includes(fn))
    .filter(l => makeDeclarationRegex(fn).test(l))
    .filter(fn => !fn.includes(asyncIdentifier))
}

exports.getFunctionSignatures = getFunctionSignatures


const flatTypes = ['Uchar', 'Char', 'Uint', 'Int', 'Number', 'String', 'Boolean']

const transfromIfFlatType = type => flatTypes.some(t => t === type) ? lowercaseFirst(type) : type

const getDeclaration = (typeString, name) => {
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

  return decl
}

const parseReturnValues = (signatureString) => {
  let returnValues = signatureString
    .substr(0, signatureString.lastIndexOf(':'))
    .trim()
    .replace('{', '')
    .replace('}', '')
    .split(',')

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

const replaceConstructorArgCommas = (argsString, replaceWith) => {
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

const parseDeclaration = (decl) => {
  const [type, name] = splitLast(decl.trim(), ' ').map(s => s.trim());
  return getDeclaration(type, name)
}

const parseFunctionSignature = (signatureString) => {
  const returnValues = signatureString.includes(':')
    ? parseReturnValues(signatureString)
    : null

  const openingBracketIdx = signatureString.indexOf('(')
  const closingBracketIdx = signatureString.lastIndexOf(')')
  const argsString = signatureString.substr(openingBracketIdx + 1, closingBracketIdx - openingBracketIdx - 1)

  const argStrings = replaceConstructorArgCommas(argsString, ';')
    .split(',')
    .map(s => s.replace(';', ','))

  console.log(signatureString)

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

  const allArgs = optionalArgs
    .concat(requiredArgs)
    .map(arg => arg.name)

  return ({
    returnValues,
    allArgs,
    requiredArgs,
    optionalArgs
  })
}

exports.parseFunctionSignature = parseFunctionSignature
