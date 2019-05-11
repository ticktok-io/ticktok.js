const axios = require('axios')
const axiosRetry = require('axios-retry')

const newClockPath = '/api/v1/clocks'

const createClock = async(clock, options) => {
  const client = axios.create({ baseURL: options.domain })
  axiosRetry(client, { retries: 3, retryCondition: () => true })
  try {
    const response = await client.post(`${newClockPath}?access_token=${options.token}`, clock)
    return response.data
  } catch (err) {
    throw new ClockCreateError(err)
  }
}

class ClockCreateError extends require('./TicktokError') {
  constructor(err) {
    super('Failed to create clock', err)
  }
}

module.exports.createClock = createClock
module.exports.newClockPath = newClockPath
module.exports.ClockCreateError = ClockCreateError
