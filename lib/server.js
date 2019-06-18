const axios = require('axios')
const axiosRetry = require('axios-retry')

const clocksPath = '/api/v1/clocks'

axios.defaults.headers.post['Content-Type'] = 'application/json'

const createClock = async(clock, options) => {
  const client = axios.create({ baseURL: options.domain })
  axiosRetry(client, { retries: 3, retryCondition: () => true })
  try {
    const response = await client.post(`${clocksPath}?access_token=${options.token}`, clock)
    return response.data
  } catch (err) {
    throw new ClockCreateError(err)
  }
}

const tick = async(clock, options) => {
  // const client = axios.create({ baseURL: options.domain })
  const clockId = await clockIdFor(clock, options)
}

const clockIdFor = async({ name, schedule }, options) => {
    const res = await axios.get(`${options.domain}${clocksPath}`, { query: { name, schedule } })
    if(res.data.length < 1) {
      throw new ClockNotFound(`Clock named:${name} with schedule:${schedule} isn't currently configured`)
    }
}

class ClockCreateError extends require('./TicktokError') {
  constructor(err) {
    super('Failed to create clock', err)
  }
}

class ClockNotFound extends require('./TicktokError') {
  constructor(err) {
    super('Clock not found', err)
  }
}

module.exports.createClock = createClock
module.exports.tick = tick
module.exports.newClockPath = clocksPath
module.exports.ClockCreateError = ClockCreateError
module.exports.ClockNotFound = ClockNotFound
