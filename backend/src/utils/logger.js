const info = (...params) => {
    console.log(...params) // eslint-disable-line no-console
}

const error = (...params) => {
    console.error(...params) // eslint-disable-line no-console
}

module.exports = {
    info,
    error,
}