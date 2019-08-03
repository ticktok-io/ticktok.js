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
        .post(server.clocksPath)
        .query(true)
        .replyWithError(new Error('network error'))
        .post(server.clocksPath)
        .query(true)
        .reply(201, { id: 222 })

      const clock = await server.createClock({ name: 'kuku', schedule: 'schedule' }, options)
      expect(clock.id).to.equal(222)
    })
  })

  describe('Manual tick', () => {
    const findClockParams = Object.assign({}, clock, { access_token: options.token })

    it('should fail on server error when finding clock', async() => {
      nock(options.domain)
        .get(server.clocksPath)
        .query(findClockParams)
        .reply(500)
      await expect(server.tick(clock, options)).to.be.rejectedWith(server.ClockTickError)
    })

    it('should fail on server error when executing tick', async() => {
      nock(options.domain)
        .get(server.clocksPath)
        .query(findClockParams)
        .reply(200, [{ id: '9871' }])
        .put(`${server.clocksPath}/9871/tick`)
        .reply(500)
      await expect(server.tick(clock, options)).to.be.rejectedWith(server.ClockTickError)
    })

    it('should fail on non existing clock', async() => {
      nock(options.domain)
        .get(server.clocksPath)
        .query(findClockParams)
        .reply(200, [])
      await expect(server.tick(clock, options)).to.be.rejected.then((error) => {
        expect(error).to.be.instanceOf(server.ClockTickError)
        expect(error.cause).to.be.instanceOf(server.ClockNotFound)
      })
    })
  })
})
