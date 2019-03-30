'use strict'

const axios = require('axios')
const amqp = require('amqplib')

function ticktok(domain, token) {
  return new Ticktok(domain, token)
}

function Ticktok(domain, token) {
  this.domain = domain
  this.token = token
}

Ticktok.prototype.schedule = async function(clock) {
  const createdClock = await createClock(this.domain, this.token, clock)
  await listenOnTicks(createdClock, clock.callback)
}

const clock = {
  named(name) {
    this.name = name
    return this
  },
  on(schedule) {
    this.schedule = schedule
    return this
  },
  invoke(callback) {
    this.callback = callback
    return this
  }
}

const createClock = async(domain, token, { name, schedule }) => {
  try {
    const response = await axios.post(`${domain}/api/v1/clocks?access_token=${token}`, { name, schedule })
    return response.data
  } catch (err) {
    throw new ClockCreateError(err)
  }
}

const listenOnTicks = async({ channel }, callback) => {
  try {
    this.connection = await amqp.connect(channel.details.uri)
    this.channel = await this.connection.createChannel()
    this.channel.consume(channel.details.queue, function(msg) {
      callback.call(msg)
    }, { noAck: true })
  } catch (err) {
    throw new ChannelError(err)
  }
}

class ClockCreateError extends require('./TicktokError') {
  constructor(message, err) {
    super('Failed to create clock', err)
  }
}

class ChannelError extends require('./TicktokError') {
  constructor(err) {
    super('Failed to connect to ticks channel', err)
  }
}

exports.ticktok = ticktok
exports.clock = clock
exports.ClockCreateError = ClockCreateError
exports.ChannelError = ChannelError
