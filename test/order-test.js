/* @flow */

const assert = require('chai').assert;
const Reader = require('../src').Reader;
const OrderToken = require('../src/tokens/order');

describe('Parsing a ORDER token', function() {
  let reader, buffer;

  beforeEach(function() {
    reader = new Reader(0x74000004);
    buffer = Buffer.alloc(7);
  });

  it('should parse the token correctly', function(done) {
    const numberOfColumns = 2;
    const length = numberOfColumns * 2;
    const columns = [3, 6];

    let offset = 0;
    buffer.writeUInt8(0xA9, offset);
    offset = 1;
    buffer.writeUInt16LE(length, offset);
    offset += 2;
    buffer.writeUInt16LE(columns[0], offset);
    offset += 2;
    buffer.writeUInt16LE(columns[1], offset);
    offset += 2;

    let token;
    reader.on('data', function(ordToken) {
      assert.instanceOf(ordToken, OrderToken);
      token = ordToken;
    });

    reader.on('error', done);

    reader.on('end', function() {
      assert.strictEqual(token.columnCount, numberOfColumns);
      assert.strictEqual(token.orderColumns[0], columns[0]);
      assert.strictEqual(token.orderColumns[1], columns[1]);

      done();
    });

    reader.end(buffer);
  });
});
