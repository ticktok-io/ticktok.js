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
  try {
    const response = await axios.post(`${this.domain}/api/v1/clocks?access_token=${this.token}`, props)
    const conn = await amqp.connect('amqp://localhost')
    const channel = await conn.createChannel()
    channel.consume(response.data.channel.details.queue, function(msg) {
      props.callback.call(msg)
    })
  } catch (e) {
    throw new ClockCreateError()
  }
}

class ClockCreateError extends require('./TicktokError') {
  constructor(message) {
    super(message || 'Failed to create clock')
  }
}

exports.ticktok = ticktok
exports.ClockCreateError = ClockCreateError
