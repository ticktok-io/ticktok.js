const axios = require('axios')
const axiosRetry = require('axios-retry')

const clocksPath = '/api/v1/clocks'

axios.defaults.headers.post['Content-Type'] = 'application/json'

const createClock = async(clock, options) => {
  const client = axios.create({ baseURL: options.domain })
  axiosRetry(client, { retries: 3, retryCondition: () => true })
  try {
    const response = await client.post(clocksPath, clock, { params: accessTokenParamFor(options) })
    return response.data
  } catch (err) {
    throw new ClockCreateError(err)
  }
}

const accessTokenParamFor = function(options) {
  return { access_token: options.token }
}

const tick = async(clock, options) => {
  try {
    const clockId = await clockIdFor(clock, options)
    await axios.put(`${options.domain}${clocksPath}/${clockId}/tick`, null, { params: accessTokenParamFor(options) })
  } catch (err) {
    throw new ClockTickError(err)
  }
}

const clockIdFor = async(clock, options) => {
  const res = await axios.get(`${options.domain}${clocksPath}`, {
    params: Object.assign({},
      accessTokenParamFor(options),
      { name: clock.name, schedule: clock.schedule })
  })
  return await firstClockIdFrom(res, clock)
}

const firstClockIdFrom = async(res, clock) => {
  if (res.data.length < 1) {
    throw new ClockNotFound(clock)
  }
  return res.data[0].id
}

class ClockCreateError extends require('./TicktokError') {
  constructor(err) {
    super('Failed to create clock', err)
  }
}

class ClockNotFound extends require('./TicktokError') {
  constructor({ name, schedule }) {
    super(`Clock named:${name} with schedule:${schedule} isn't currently configured`)
  }
}

class ClockTickError extends require('./TicktokError') {
  constructor(err) {
    super('Failed to execute tick', err)
  }
}

module.exports.createClock = createClock
module.exports.tick = tick
module.exports.clocksPath = clocksPath
module.exports.ClockCreateError = ClockCreateError
module.exports.ClockNotFound = ClockNotFound
module.exports.ClockTickError = ClockTickError
