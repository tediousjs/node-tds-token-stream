/* @flow */

const assert = require('chai').assert;
const Reader = require('../src').Reader;
const DoneToken = require('../src/tokens/done');

describe('Parsing a DONE token', function() {
  let reader;

  beforeEach(function() {
    reader = new Reader(0x07000000);
  });

  it('should parse the token correctly', function(done) {
    const buffer = Buffer.alloc(1 + 8);
    buffer.writeUInt8(0xFD, 0);
    buffer.writeUInt16LE(0x0000, 1);
    buffer.writeUInt16LE(0x0000, 3);
    buffer.writeUInt32LE(1234, 5);

    const tokens = [];

    reader.on('data', function(token) {
      assert.instanceOf(token, DoneToken);
      tokens.push(token);
    });

    reader.on('error', done);

    reader.on('end', function() {
      assert.lengthOf(tokens, 1);

      const token = tokens[0];
      assert.isFalse(token.more);

      done();
    });

    reader.end(buffer);
  });
});
