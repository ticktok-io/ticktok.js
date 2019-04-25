const axios = require('axios')

function serverSDK(domain, token) {
  return new ServerSDK(domain, token)
}

class ServerSDK {
  constructor(domain, token) {
    this.domain = domain
    this.token = token
  }

  async createClock(clock) {
    try {
      const response = await axios.post(`${this.domain}/api/v1/clocks?access_token=${this.token}`, clock)
      return response.data
    } catch (err) {
      throw new ClockCreateError(err)
    }
  }
}

class ClockCreateError extends require('./TicktokError') {
  constructor(message, err) {
    super('Failed to create clock', err)
  }
}

module.exports = serverSDK
