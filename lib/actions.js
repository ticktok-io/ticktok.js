'use strict'

const server = require('./server')
const channel = require('./channel')

const schedule = async(clock, callback) => {
  const createdClock = await server.createClock(clock, this.options)
  await channel.register(createdClock, callback)
}


