const nock = require('nock')

const DOMAIN = 'http://nock.ticktok'
const TOKEN = '1029'

let receivedRequest = ''

exports.start = () => {
  nock(DOMAIN)
    .post('/api/v1/clocks')
    .query({ 'access_token': TOKEN })
    .reply((uri, body) => {
      receivedRequest = JSON.parse(body)
      return [400, '']
    })
}

exports.receivedRequest = () => {
  return receivedRequest
}

exports.DOMAIN = DOMAIN
exports.TOKEN = TOKEN
