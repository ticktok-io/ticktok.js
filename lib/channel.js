'use strict'

const amqp = require('amqplib')
const axios = require('axios')

function tickListener() {
  return new TickListener()
}

class TickListener {
  constructor() {
    this.registeredClocks = []
    this.tickers = new Map([
      ['rabbit', new RabbitTicker()],
      ['http', new HttpTicker()]
    ])
  }

  async register(clock, callback) {
    this.validateChannelType(clock.channel)
    await this.tickers.get(clock.channel.type).updateCallback(clock.id, callback)
    await this.createListenerIfNeeded(clock)
  }

  async createListenerIfNeeded(clock) {
    if (!this.registeredClocks.includes(clock.id)) {
      await this.tickers.get(clock.channel.type).createListener(clock.id, clock.channel.details)
    }
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
    this.registeredClocks = []
  }

  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
  }
}

class RabbitTicker {
  constructor() {
    this.callbacks = new Map()
  }

  updateCallback(id, callback) {
    this.callbacks.set(id, callback)
  }

  async createListener(id, details) {
    try {
      if (!this.connection || !this.channel) {
        this.connection = await amqp.connect(details.uri)
        this.channel = await this.connection.createChannel()
      }
      await this.channel.consume(details.queue, (msg) => {
        this.callbacks.get(id).call(msg)
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
    this.listeners = {}
    this.callbacks = {}
  }

  updateCallback(id, callback) {
    this.callbacks[id] = callback
  }

  async createListener(id, details) {
    this.listeners[id] = setInterval(async() => {
      await this.dispatchAvailableTicksFor(id, details)
    }, httpInterval)
  }

  async dispatchAvailableTicksFor(id, details) {
    try {
      const response = await axios.get(details.url)
      if (response.data.length > 0) {
        this.callbacks[id](undefined, response.data[0])
      }
    } catch (err) {
      if (this.callbacks[id]) {
        this.callbacks[id](new Error(err))
      }
    }
  }

  async disconnect() {
    Object.values(this.listeners).forEach((i) => { clearInterval(i) })
    this.callbacks = {}
    this.listeners = {}
  }
}

class ChannelError extends require('./TicktokError') {
  constructor(err) {
    super('Failed to connect to ticks channel', err)
  }
}

module.exports = tickListener
module.exports.ChannelError = ChannelError
