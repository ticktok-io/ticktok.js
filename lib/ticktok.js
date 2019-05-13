'use strict'

const server = require('./server')
const channel = require('./channel')

function ticktok(domain, token) {
  return new Ticktok(domain, token)
}

class Ticktok {
  constructor(domain, token) {
    this.options = { domain, token }
    this.tickListener = channel()
  }

  async schedule(clock, callback) {
    const createdClock = await server.createClock(clock, this.options)
    await this.tickListener.register(createdClock, callback)
  }

  async disconnect() {
    await this.tickListener.disconnect()
  }
}

module.exports = exports = ticktok
