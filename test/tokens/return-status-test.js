/* @flow */

const assert = require('chai').assert;
const Writer = require('../../src').Writer;
const Reader = require('../../src').Reader;
const ReturnStatus = require('../../src/tokens/return-status');

describe('Writing a `RETURNSTATUS` token', function() {
  let writer;

  beforeEach(function() {
    writer = new Writer(0x07000000);
  });

  it('should convert the token correctly', function(done) {
    const token = new ReturnStatus(5701);

    const chunks = [];

    writer.on('error', done);

    writer.on('data', function(chunk) {
      chunks.push(chunk);
    });

    writer.on('end', function() {
      const result = Buffer.concat(chunks);

      assert.lengthOf(result, 5);
      assert.deepEqual(result, Buffer.from([
        // TokenType
        0x79,

        // Status
        0x45, 0x16, 0x00, 0x00
      ]));

      done();
    });

    writer.end(token);
  });
});

describe('Reading a `RETURNSTATUS` token', function() {
  let reader;

  beforeEach(function() {
    reader = new Reader(0x07000000);
  });

  it('should parse the token correctly', function(done) {
    const buffer = Buffer.from([
      // TokenType
      0x79,

      // Status
      0x45, 0x16, 0x00, 0x00
    ]);

    const tokens = [];

    reader.on('data', function(token) {
      assert.instanceOf(token, ReturnStatus);
      tokens.push(token);
    });

    reader.on('error', done);

    reader.on('end', function() {
      assert.lengthOf(tokens, 1);

      const token: ReturnStatus = tokens[0];
      assert.strictEqual(5701, token.value);

      done();
    });

    reader.end(buffer);
  });
});
