'use strict'

const server = require('./server')
const channel = require('./channel')

function ticktok(domain, token) {
  return new Ticktok(domain, token)
}

class Ticktok {
  constructor(domain, token) {
    this.server = server(domain, token)
  }

  async schedule(clock, callback) {
    const createdClock = await this.server.createClock(clock)
    await channel.consume(createdClock.channel, callback)
  }
}

module.exports = exports = ticktok
