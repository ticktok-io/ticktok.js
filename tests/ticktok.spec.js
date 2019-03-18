'use strict'

const expect = require('chai').expect
const server = require('./ticktok-server')
const { ticktok, TicktokError } = require('../lib/ticktok')

describe('Ticktok', function() {
  it('should fail on non valid schedule', async() => {
    server.start()
    const clockRequest = { name: 'kuku', schedule: 'invalid' };
    await ticktok(server.DOMAIN, server.TOKEN).createClock(clockRequest).catch((err) => {
      expect(() => { throw err })
        .to.throw(TicktokError)
    })
    expect(server.receivedRequest()).to.eql(clockRequest)
  })
})
