const ticktok = require('ticktok')

const domain = process.env.TICKTOK_DOMAIN || 'http://localhost:9643'
const token = process.env.TICKTOK_TOKEN || 'ticktok-zY3wpR'

describe('Tictok sanity', () => {
  this.ticktok = ticktok(domain, '111222')

  it('should schedule simple interval', (done) => {
    let tickCount = 0
    this.ticktok.schedule({ name: 'sanity:simple-interval', schedule: 'every.2.seconds' }, (err, tick) => {
      tickCount++
      if (!err && tickCount == 2) {
        done()
      }
    })
  }).timeout(5 * 1000)

  it('should invoke a tick', (done) => {
    this.ticktok.schedule({ name: 'sanity:tick', schedule: '@never' }, (err, tick) => {
      if (!err) done()
    }).then(() => {
      this.ticktok.tick({ name: 'sanity:tick', schedule: '@never' })
    })
  })

})
