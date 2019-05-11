'use strict'

const nock = require('nock')
const channel = require('../lib/channel')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
const expect = chai.expect
const serverDomain = 'http://localhost:9191'

describe('Tick Channel', () => {
  beforeEach(() => {
    this.listener = channel()
  })

  afterEach(async() => {
    await this.listener.disconnect()
    nock.cleanAll()
  })

  it('fail on unsupported channel type', async() => {
    await expect(this.listener.register({ id: '432', channel: { type: 'unknown' } }, () => {}))
      .to.be.rejectedWith(channel.ChannelError)
  })

  describe('Http channel', () => {
    it('should retrieve errors when failing to fetch ticks', (done) => {
      nock(serverDomain)
        .get('/111/pop')
        .replyWithError('oops')

      register('111', (err, tick) => {
        expect(err.message).to.contain('oops')
        done()
      })
    })

    const register = (id, callback) => {
      this.listener.register(
        { id: id, channel: { type: 'http', details: { url: `${serverDomain}/${id}/pop` } } }, callback)
    }

    it('should receive ticks', (done) => {
      nock(serverDomain)
        .get('/1/pop')
        .reply(200, [{ schedule: 's1' }])
        .get('/1/pop')
        .reply(200, [{ schedule: 's1' }])

      let ticks = []
      register(1, (err, schedule) => {
        ticks.push(schedule)
        if (ticks.includes('s1') && ticks.length > 1) done()
      })
    })

    it('disconnect all', (done) => {
      nock(serverDomain)
        .get('/1/pop')
        .reply(200, [{ schedule: 's1' }])
        .get('/2/pop')
        .reply(200, [{ schedule: 's2' }])

      let tickCount = 0
      setTimeout(() => {
        expect(tickCount).to.equal(0)
        done()
      }, 2000)

      register(1, (err, schedule) => { tickCount++ })
      register(2, (err, schedule) => { tickCount++ })
      this.listener.disconnect()
    })

    it('should not tick when no ticks available', (done) => {
      nock(serverDomain)
        .get('/1/pop')
        .times(2)
        .reply(200, [])

      register(1, (err, schedule) => {
        if (!err) err = new Error('got ticked')
        done(err)
      })
      setTimeout(() => { done() }, 1500)
    })

    it('should replace listener upon register with same parameters', (done) => {
      nock(serverDomain)
        .get('/1/pop')
        .times(1)
        .reply(200, [])

      let newListenerCount = 0
      register(1, () => { done(new Error('Old listener got ticks')) })
      register(1, () => { newListenerCount++ })
      setTimeout(() => {
        expect(newListenerCount).to.be.greaterThan(0)
        done()
      }, 3000)

      nock(serverDomain)
        .get('/1/pop')
        .times(2)
        .reply(200, [{ schedule: 's' }])
    })
  })
})
