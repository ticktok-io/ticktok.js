'use strict'

const amqp = require('amqplib')
const axios = require('axios')

function tickListener() {
  return new TickListener()
}

class TickListener {
  constructor() {
    this.tickers = new Map([
      ['rabbit', new RabbitTicker()],
      ['http', new HttpTicker()]
    ])
  }

  async register(clock, callback) {
    const channel = clock.channel
    this.validateChannelType(channel)
    await this.tickers.get(channel.type).register(clock.id, channel.details, callback)
  }

  validateChannelType(channel) {
    if (!this.tickers.has(channel.type)) {
      throw new ChannelError(`Channel type: ${channel.type} is not supported yet`)
    }
  }

  async disconnect() {
    await this.asyncForEach(Array.from(this.tickers.values()), async(t) => {
      await t.disconnect()
    })
  }

  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
  }
}

class RabbitTicker {
  async register(id, details, callback) {
    try {
      if (!this.connection || !this.channel) {
        this.connection = await amqp.connect(details.uri)
        this.channel = await this.connection.createChannel()
      }
      await this.channel.consume(details.queue, function(msg) {
        callback.call(msg)
      }, { noAck: true })
    } catch (err) {
      throw new ChannelError(err)
    }
  }

  async disconnect() {
    try {
      await this.channel.close()
    } catch (err) {
    }
    try {
      await this.connection.close()
    } catch (err) {

    }
  }
}

const httpInterval = 1000

class HttpTicker {
  constructor() {
    this.jobs = {}
    this.callbacks = {}
  }

  async register(id, details, callback) {
    this.updateCallback(id, callback)
    if (!(id in this.jobs)) {
      await this.createListener(id, details)
    }
  }

  updateCallback(id, callback) {
    this.callbacks[id] = callback
  }

  async createListener(id, details) {
    this.jobs[id] = setInterval(async() => {
      try {
        const response = await axios.get(details.url)
        if (response.data.length > 0) {
          this.callbacks[id](undefined, response.data[0].schedule)
        }
      } catch (err) {
        this.callbacks[id](new Error(err))
      }
    }, httpInterval)
  }

  async disconnect() {
    this.callbacks = {}
    Object.values(this.jobs).forEach((j) => { clearInterval(j) })
    this.jobs = {}
  }
}

class ChannelError extends require('./TicktokError') {
  constructor(err) {
    super('Failed to connect to ticks channel', err)
  }
}

module.exports = tickListener
module.exports.ChannelError = ChannelError
