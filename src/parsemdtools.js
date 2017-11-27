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

const parseReturnValues = (signatureString) => {
  let returnValues = signatureString
    .substr(0, signatureString.lastIndexOf(':'))
    .trim()
    .replace('{', '')
    .replace('}', '')
    .split(',')

  if (returnValues.length === 1) {
    return ([{
      type: returnValues[0],
      name: 'returnValue'
    }])
  }

  return returnValues.map(
    nameAndType => nameAndType
      .split(':')
      .map(el => el.trim())
      .reduce((name, type) => ({ name, type }))
  )
}

const replaceConstructorArgCommas = (argsString, replaceWith) => {
  let strCopy = '';
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
  const [type, name] = decl.split(' ').map(s => s.trim());
  return ({
    type,
    name
  });
}

const parseFunctionSignature = (signatureString) => {
  const returnValues = signatureString.includes(':')
    ? parseReturnValues(signatureString)
    : null;

  const openingBracketIdx = signatureString.indexOf('(')
  const closingBracketIdx = signatureString.lastIndexOf(')')
  const argsString = signatureString.substr(openingBracketIdx + 1, closingBracketIdx - openingBracketIdx - 1)

  const argStrings = replaceConstructorArgCommas(argsString, ';').split(',')

  const optionalArgs = argStrings
    .filter(s => s.includes('='))
    .map((s) => {
      const [declaration, defaultValue] = s.split('=').map(s => s.trim())
      return Object.assign({}, parseDeclaration(declaration), { defaultValue })
    })

  const requiredArgs = argStrings
    .filter(s => !s.includes('='))
    .map(s => parseDeclaration(s.trim()))

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
