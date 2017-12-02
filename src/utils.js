const transformFirstLetter = (str, fn) => `${str[0][fn]()}${str.substr(1)}`

exports.capitalizeFirst = str => transformFirstLetter(str, 'toUpperCase')

exports.lowercaseFirst = str => transformFirstLetter(str, 'toLowerCase')

exports.isUint = n => (typeof n === 'string' || typeof n === 'number') && /^[0-9]+$/.test(`${n}`)

exports.splitLast = (str, c) => {
  const idx = str.lastIndexOf(c)
  if (idx === -1) {
    return [str]
  }
  return [str.substr(0, idx), str.substr(idx + 1)]
}

exports.logd = process.env.QUITE ? () => {} : console.log
