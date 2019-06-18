'use strict'

const chai = require('chai')
const nock = require('nock')
const chaiAsPromised = require('chai-as-promised')
const server = require('../lib/server')

chai.use(chaiAsPromised)
const expect = chai.expect

const options = { domain: 'http://localhost:9999', token: '123' }
const clock = { name: 'kuku', schedule: 'every.10.seconds' }

describe('Server actions', () => {

  describe('Clock creation', () => {

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

  describe('Manual tick', () => {
    it('should fail on server error when finding clock', async() => {
      nock(options.domain)
        .get('/api/v1/clocks')
        .query(clock)
        .reply(500)
      await expect(server.tick(clock, options)).to.be.rejectedWith(server.ClockTickError)
    })

    it('should fail on server error when executing tick', async() => {
      nock(options.domain)
        .get('/api/v1/clocks')
        .query(clock)
        .reply(200, [{ id: '9871' }])
        .post('/api/v1/clocks/9871/tick')
        .reply(500)
      await expect(server.tick(clock, options)).to.be.rejectedWith(server.ClockTickError)
    })
  })

})
