const mdh2 = '##'
const mdh3 = '###'
const asyncIdentifier = 'Async'
const makeDeclarationRegex = fn => new RegExp(`^${fn}\\(.*\\)|(\\.|\\s)${fn}\\(.*\\)`)

const extractRegion = (lines, regionName) => {
  const from = lines.findIndex(l => l.includes(mdh2) && l.includes(regionName))
  if (from === -1) {
    throw new Error(`region ${regionName} not found in md file`)
  }

  const sub = lines.slice(from + 1)
  let to = sub.findIndex(l => l.includes(mdh2))
  to = to === -1 ? sub.length - 1 : to

  return sub.slice(0, to)
}

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
    .map(fn => ({ fnName: fn, hasAsync: hasAsyncFn.has(fn) }))

  return fns
}

const getFunctionSignatures = (lines, fn) => {
  return lines
    .filter(l => l.includes(fn))
    .filter(l => makeDeclarationRegex(fn).test(l))
    .filter(fn => !fn.includes(asyncIdentifier))
}

module.exports = {
  extractRegion,
  extractFunctions,
  getFunctionSignatures
}