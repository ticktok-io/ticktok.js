'use strict'

const server = require('./server')
const channel = require('./channel')

function ticktok(domain, token) {
  return new Ticktok(domain, token)
}

class Ticktok {
  constructor(domain, token) {
    this.server = server(domain, token)
    this.tickListener = channel()
  }

  async schedule(clock, callback) {
    const createdClock = await this.server.createClock(clock)
    await this.tickListener.register(createdClock.channel, callback)
  }
}

module.exports = exports = ticktok
