module.exports = class TicktokError extends Error {
  constructor(message, cause) {
    super(`${message} [${cause}]`)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.cause = cause
  }
}
