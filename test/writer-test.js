/* @flow */

const assert = require('chai').assert;
const Writer = require('../src/writer');
const DoneToken = require('../src/tokens/done');

describe('Writing a DONE token', function() {
  let writer;

  beforeEach(function() {
    writer = new Writer(0x07000000);
  });

  it('should convert the token correctly', function(done) {
    const token = new DoneToken();
    token.isCountValid = true;
    token.rowCount = 20;

    const chunks = [];

    writer.on('error', done);

    writer.on('data', function(chunk) {
      chunks.push(chunk);
    });

    writer.on('end', function() {
      const result = Buffer.concat(chunks);

      assert.lengthOf(result, 9);
      assert.deepEqual(result, Buffer.from([0xfd, 0x10, 0x00, 0x00, 0x00, 0x14, 0x00, 0x00, 0x00]));

      done();
    });

    writer.end(token);
  });
});
