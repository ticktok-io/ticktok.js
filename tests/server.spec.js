'use strict'

const chai = require('chai')
const nock = require('nock')
const server = require('../lib/server')

const expect = chai.expect

const options = { domain: 'http://localhost:9999', token: '123' }

describe('Server actions', () => {
  it('should retry on failure to create a clock', async() => {
    nock(options.domain)
      .post(server.newClockPath)
      .query(true)
      .replyWithError(new Error('network error'))
      .post(server.newClockPath)
      .query(true)
      .reply(201, { id: 222 })

    const clock = await server.createClock({ name: 'kuku', schedule: 'schedule' }, options)
    expect(clock.id).to.equal(222)
  })
})
