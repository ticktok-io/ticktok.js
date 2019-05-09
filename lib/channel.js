'use strict'

const amqp = require('amqplib')

function tickListener() {
  return new TickListener()
}

class TickListener {
  async register({ details }, callback) {
    try {
      this.connection = await amqp.connect(details.uri)
      this.channel = await this.connection.createChannel()
      this.channel.consume(details.queue, function(msg) {
        callback.call(msg)
      }, { noAck: true })
    } catch (err) {
      throw new ChannelError(err)
    }
  }
}

class ChannelError extends require('./TicktokError') {
  constructor(err) {
    super('Failed to connect to ticks channel', err)
  }
}

module.exports = tickListener
