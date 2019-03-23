const nock = require('nock')
const expect = require('chai').expect
const amqp = require('amqplib')

const DOMAIN = 'http://nock.ticktok'
const TOKEN = '1029'
const INVALID_SCHEDULE = 'invalid'

let connection
let channel
let receivedRequest = ''
let overrides = {}

const rabbitUri = 'amqp://localhost'
const queueName = 'spec-tick-queue'

const start = async() => {
  await startRabbit()
  this.overrides = overrides
  nock(DOMAIN)
    .post('/api/v1/clocks')
    .query({ 'access_token': TOKEN })
    .reply((uri, body) => {
      receivedRequest = JSON.parse(body)
      if (receivedRequest.schedule === INVALID_SCHEDULE) {
        return [400, '']
      }
      return [201, JSON.stringify({
        channel: {
          details:
            {
              rabbitUri: this.overrides.rabbitUri || rabbitUri,
              queue: this.overrides.queue || queueName
            }
        }
      })]
    })
}

const startRabbit = async() => {
  connection = await amqp.connect(rabbitUri)
  channel = await connection.createChannel()
  channel.assertQueue(queueName, { durable: false })
}

const receivedRequestIs = (request) => {
  expect(receivedRequest).to.eql(request)
}

const tick = () => {
  channel.sendToQueue(queueName, Buffer.from('tick'))
}

const stop = async() => {
  await channel.close()
  await connection.close()
}

exports.DOMAIN = DOMAIN
exports.TOKEN = TOKEN
exports.INVALID_SCHEDULE = INVALID_SCHEDULE
exports.overrides = overrides
exports.start = start
exports.receivedRequestIs = receivedRequestIs
exports.tick = tick
exports.stop = stop
