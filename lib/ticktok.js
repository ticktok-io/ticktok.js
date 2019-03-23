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

Ticktok.prototype.clock = async function(props) {
  const clock = await createClock(this.domain, this.token, props)
  await listenOnTicks(clock, props.onTick)
}

const createClock = async(domain, token, props) => {
  try {
    const response = await axios.post(`${domain}/api/v1/clocks?access_token=${token}`, props)
    return response.data
  } catch (err) {
    throw new ClockCreateError(err)
  }
}

const listenOnTicks = async({ channel }, callback) => {
  try {
    const conn = await amqp.connect(channel.details.rabbitUri)
    const ch = await conn.createChannel()
    ch.consume(channel.details.queue, function(msg) {
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
exports.ClockCreateError = ClockCreateError
exports.ChannelError = ChannelError
