/* @flow */

const assert = require('chai').assert;
const Reader = require('../src').Reader;
const SSPIToken = require('../src/tokens/sspi');

describe('sspi-token', function() {
  let reader;
  beforeEach(function() {
    reader = new Reader(0x74000004);
  });

  it('should parse the token correctly', function(done) {

    const sspiData = 'sspiToken';
    const buffer = Buffer.alloc(sspiData.length + 3);
    let offset = 0;
    buffer.writeUInt8(0xED, offset++);
    buffer.writeInt16LE(sspiData.length, offset);
    offset += 2;
    buffer.write(sspiData, offset);

    let token;
    reader.on('data', function(data) {
      assert.instanceOf(data, SSPIToken);
      token = data;
    });

    reader.on('error', done);

    reader.on('end', function() {
      assert.strictEqual(token.SSPIBuffer.toString(), sspiData);
      done();
    });

    reader.end(buffer);
  });
});
