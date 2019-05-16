# Ticktok.io JS Client
[![CircleCI](https://circleci.com/gh/ticktok-io/ticktok.js.svg?style=svg)](https://circleci.com/gh/ticktok-io/ticktok.js)
[![Release](https://img.shields.io/github/release/ticktok-io/ticktok.js.svg)](https://github.com/ticktok-io/ticktok.js/releases/tag/0.2.1)
[![License](http://img.shields.io/:license-apache2.0-red.svg)](http://doge.mit-license.org)
[![Gitter](https://badges.gitter.im/ticktok-io/community.svg)](https://gitter.im/ticktok-io/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

## Description
This is a Javascript client for [Ticktok.io](https://ticktok.io). It allows to easily creating new clocks and invoke actions on ticks.

## Installation
```
npm i ticktok
```

## Examples
### Register an action for a clock
```javascript
const ticktok = require('ticktok')

ticktok('https://ticktok', 'token')
  .schedule({ name: 'kuku', schedule: 'every.10.seconds'}, (err, tick) => { console.log('tick') })
```

## Community
Have some questions/ideas? Chat with us on [Gitter](https://gitter.im/ticktok-io/community?utm_source=share-link&utm_medium=link&utm_campaign=share-link)
