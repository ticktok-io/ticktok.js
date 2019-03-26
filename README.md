# Ticktok.io JS Client
[![CircleCI](https://circleci.com/gh/ticktok-io/ticktok-js-client.svg?style=svg)](https://circleci.com/gh/ticktok-io/ticktok-js-client)

## Description
This is a Javascript client for [Ticktok.io](https://ticktok.io). It allows to easily creating new clocks and invoke actions on ticks.

## Installation
```
npm i ticktok
```

## Examples
### Register an action for a clock
```javascript
const { ticktok } = require('ticktok')

ticktok('https://ticktok', 'token')
  .clock({name: 'kuku', schedule: 'every.10.seconds', onTick: () => { console.log('tick')}})
```

## Community
Have some questions/ideas? chat with us on [Slack](https://join.slack.com/t/ticktokio/shared_invite/enQtNTE0MzExNTY5MjIzLThjNDU3NjIzYzQxZTY0YTM5ODE2OWFmMWU3YmQ1ZTViNDVmYjZkNWUzMWU5NWU0YmU5NWYxMWMxZjlmNGQ1Y2U)

