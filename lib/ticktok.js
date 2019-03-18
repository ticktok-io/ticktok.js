const axios = require('axios')

const ticktok = (domain, token) => (
  {
    domain,
    token,
    createClock(props) {
      return new Promise(async(resolve, reject) => {
        try {
          await axios.post(`${domain}/api/v1/clocks?access_token=${token}`, props)
        } catch (e) {
          // nothing
        }
        reject(new TicktokError('Failed to create a clock'))
      })
    }
  }
)

class TicktokError extends Error {
  constructor(message) {
    super(message)
    this.name = this.constructor.name
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = (
        new Error(message)).stack
    }
  }
}

exports.ticktok = ticktok
exports.TicktokError = TicktokError
