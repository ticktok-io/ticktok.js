const nock = require('nock')
const expect = require('chai').expect
const amqp = require('amqplib')

const DOMAIN = 'http://nock.ticktok'
const TOKEN = '1029'
const INVALID_SCHEDULE = 'invalid'

let receivedRequest = ''
const rabbitUri = 'amqp://localhost'
const queueName = 'spec-tick-queue'

const start = (overrides) => {
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
            { rabbitUri: rabbitUri || overrides.rabbitUri, queue: queueName }
        }
      })]
    })
}

const receivedRequestIs = (request) => {
  expect(receivedRequest).to.eql(request)
}

const tick = async() => {
  const conn = await amqp.connect(rabbitUri)
  const channel = await conn.createChannel()
  channel.assertQueue(queueName, { durable: false })
  channel.sendToQueue(queueName, Buffer.from('tick'))
}

exports.DOMAIN = DOMAIN
exports.TOKEN = TOKEN
exports.INVALID_SCHEDULE = INVALID_SCHEDULE
exports.start = start
exports.receivedRequestIs = receivedRequestIs
exports.tick = tick
