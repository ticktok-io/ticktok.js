'use strict'

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const server = require('./ticktok-server')
const ticktok = require('..')

chai.use(chaiAsPromised)
const expect = chai.expect

describe('Ticktok', () => {
  beforeEach(() => {
    this.ticktok = ticktok(server.DOMAIN, server.TOKEN)
    return server.start()
  })

  afterEach(async() => {
    await server.stop()
  })

  it('should fail on non valid schedule', async() => {
    const clock = { name: 'popo', schedule: server.INVALID_SCHEDULE }
    await expect(this.ticktok.schedule(clock))
      .to.be.rejectedWith(ticktok.ClockCreateError)
    server.receivedRequestIs(clock)
  })

  it('should invoke on tick', (done) => {
    this.ticktok.schedule({ name: 'kuku', schedule: 'every.2.seconds' }, () => done())
    server.tick()
  })

  it('should fail on rabbit connection', () => {
    server.overrides = { rabbitUri: 'amqp://invalid' }
    return expect(this.ticktok.schedule({ name: 'kuku', schdule: 'every.6.seconds' }))
      .to.be.rejectedWith(ticktok.ChannelError)
  })
})
