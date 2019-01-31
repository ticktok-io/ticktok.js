const expect = require('chai').expect;
const ticktok = require('../lib/ticktok');

describe('Ticktok', function () {
  it('should retrieve Hello', () => {
    expect(ticktok())
  });
});
