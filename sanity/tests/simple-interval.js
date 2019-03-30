const { ticktok, clock } = require('ticktok')

const domain = process.env.TICKTOK_DOMAIN || 'http://localhost:8080'
const token = process.env.TICKTOK_TOKEN || 'ticktok-zY3wpR'

describe('ticktok.io', () => {
  it('simple-interval', () => {
    let ticksReceived = 0
    return new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error('Failed to get enough ticks')), 4 * 1000)
      ticktok(domain, token)
        .schedule(clock.named('simple-interval').on('every.10.seconds').invoke(() => {
          ticksReceived++
          if (ticksReceived === 3) {
            resolve()
          }
        }))
    })
  })
})
