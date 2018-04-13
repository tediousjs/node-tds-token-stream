/* @flow */

const assert = require('chai').assert;
const Reader = require('../src').Reader;
const ReturnStatusToken = require('../src/tokens/returnStatus');

describe('Parsing a RETURNSTATUS token', function() {
  let reader, buffer;

  beforeEach(function() {
    reader = new Reader(0x74000004);
    buffer = Buffer.alloc(5);
  });

  it('should parse the token correctly', function(done) {
    const returnValue = 56;

    buffer.writeUInt8(0x79, 0);
    buffer.writeInt32LE(returnValue, 1);
    let token;
    reader.on('data', function(statusToken) {
      assert.instanceOf(statusToken, ReturnStatusToken);
      token = statusToken;
    });

    reader.on('error', done);

    reader.on('end', function() {
      assert.strictEqual(token.value, returnValue);
      done();
    });

    reader.end(buffer);
  });
});
