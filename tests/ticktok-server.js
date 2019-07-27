'use strict'

const nock = require('nock')
const expect = require('chai').expect
const amqp = require('amqplib')
const URLSearchParams = require('url').URLSearchParams;
const URL = require('url').URL

const DOMAIN = 'http://nock.ticktok'
const TOKEN = '1029'
const INVALID_SCHEDULE = 'invalid'
const TICK_MSG = 'tick'

let connection
let channel
let receivedRequest = ''
let searchParams = {}
let overrides = {}
let clocks = {}
let tickedClocks = []

const rabbitUri = 'amqp://localhost'
const queueName = 'spec-tick-queue'

const start = async() => {
  await startRabbit()
  this.overrides = overrides
  nock(DOMAIN)
    .post('/api/v1/clocks')
    .times(2)
    .query({ 'access_token': TOKEN })
    .reply((uri, body) => {
      return createResultFor(body)
    })
    .get('/api/v1/clocks')
    .query(true)
    .reply((uri, body) => {
      const resultClocks = []
      const urlParams = new URLSearchParams(new URL('http://bla' + uri).search)
      const clockKey = `${urlParams.get('name')}${urlParams.get('schedule')}`
      if(clockKey in clocks) {
        resultClocks.push({ id: clocks[clockKey] })
      }
      return [200, resultClocks]
    })
    .post(/api\/v1\/clocks\/.+\/tick$/)
    .reply((uri, body) => {
      const ids = []
      const res = uri.match(/api\/v1\/clocks\/(.+)\/tick$/)
      if(Object.values(clocks).includes(res[1])) {
        tickedClocks.push(res[1])
        ids.push({id: res[1]})
      }
      [200, JSON.stringify(ids)]
    })
}

const createResultFor = (body) => {
  receivedRequest = JSON.parse(body)
  if (receivedRequest.schedule === INVALID_SCHEDULE) {
    return [400, '']
  }
  return [201, JSON.stringify({
    channel: {
      type: 'rabbit',
      details:
        {
          uri: this.overrides.rabbitUri || rabbitUri,
          queue: this.overrides.queue || queueName
        }
    }
  })]
}

const startRabbit = async() => {
  connection = await amqp.connect(rabbitUri)
  channel = await connection.createChannel()
  await channel.assertExchange('spec-ex', 'fanout')
  await channel.assertQueue(queueName, { autoDelete: true })
  await channel.bindQueue(queueName, 'spec-ex', '')
}

const receivedRequestIs = (request) => {
  expect(receivedRequest).to.eql(request)
}

const tick = () => {
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify({ schedule: TICK_MSG })))
}

const receivedTickFor = (id) => {
  expect(tickedClocks).to.include(id)
}

const addClock = (clock) => {
  clocks[`${clock.name}${clock.schedule}`] = clock.id
}

const stop = async() => {
  await channel.close()
  await connection.close()
  nock.cleanAll()
  clocks = {}
  tickedClocks = []
}

const clockSearchedWith = (params) => {
  expect(searchParams).to.eql(params)
}

exports.DOMAIN = DOMAIN
exports.TOKEN = TOKEN
exports.INVALID_SCHEDULE = INVALID_SCHEDULE
exports.TICK_MSG = TICK_MSG
exports.overrides = overrides
exports.start = start
exports.receivedRequestIs = receivedRequestIs
exports.clockSearchedWith = clockSearchedWith
exports.addClock = addClock
exports.receivedTickFor = receivedTickFor
exports.tick = tick
exports.stop = stop
