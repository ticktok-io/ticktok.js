'use strict'

module.exports = require('./lib/ticktok')
module.exports.ChannelError = require('./lib/channel').ChannelError
module.exports.ClockCreateError = require('./lib/server').ClockCreateError
module.exports.ClockNotFound = require('./lib/server').ClockNotFound
module.exports.ClockTickError = require('./lib/server').ClockTickError
