'use strict'

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const server = require('./ticktok-server')
const ticktok = require('..')

chai.use(chaiAsPromised)
const expect = chai.expect

const popo1seconds = { name: 'popo', schedule: 'every.1.seconds' }
const kuku2seconds = { name: 'kuku', schedule: 'every.2.seconds' }

describe('Ticktok', () => {
  beforeEach(() => {
    this.ticktok = ticktok(server.DOMAIN, server.TOKEN)
    return server.start()
  })

  afterEach(async() => {
    await server.stop()
    await this.ticktok.disconnect()
  })

  it('should fail on non valid schedule', async() => {
    const clock = { name: 'popo', schedule: server.INVALID_SCHEDULE }
    await expect(this.ticktok.schedule(clock))
      .to.be.rejectedWith(ticktok.ClockCreateError)
    server.receivedRequestIs(clock)
  })

  it('should invoke on tick', (done) => {
    this.ticktok.schedule(kuku2seconds, (err, tick) => {
      if (!err && tick.schedule === server.TICK_MSG) done()
    })
    server.tick()
  })

  it('should fail on rabbit connection', () => {
    server.overrides = { rabbitUri: 'amqp://invalid' }
    return expect(this.ticktok.schedule(kuku2seconds))
      .to.be.rejectedWith(ticktok.ChannelError)
  })

  it('should disconnect all clock', async() => {
    let tickCount = 0
    await this.ticktok.schedule(kuku2seconds, () => { tickCount++ })
    await this.ticktok.schedule(popo1seconds, () => { tickCount++ })
    await this.ticktok.disconnect()
    server.tick()
    await new Promise(resolve => setTimeout(resolve, 1000))
    expect(tickCount).to.equal(0)
  })

  describe('Manual tick', () => {
    it('should fail on clock not found', async() => {
      await expect(this.ticktok.tick(kuku2seconds)).to.be.rejectedWith(ticktok.ClockNotFound)
    })

    it('should invoke a manual tick', async() => {
      server.addClock(Object.assign({}, { id: '919123' }, kuku2seconds))
      await this.ticktok.tick(kuku2seconds)
      expect(server.receivedTickFor('919123'))
    })
  })
})
