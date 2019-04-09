'use strict'

const amqp = require('amqplib')

async function tickConsumer() {
  return new TickConsumer()
}

class TickConsumer {
  async consume(tickChannel, callback) {
    try {
      const connection = await amqp.connect(this.uri)
      const channel = await this.connection.createChannel()
      this.channel.consume(queue, function(msg) {
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

module.exports = {
  create
}
