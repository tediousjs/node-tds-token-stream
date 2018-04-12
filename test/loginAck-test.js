/* @flow */

const assert = require('chai').assert;
const Reader = require('../src').Reader;
const LoginAckToken = require('../src/tokens/loginack');


describe('Parsing an INFO token', function() {
  const encoding = 'ucs2';
  let reader;

  beforeEach(function() {
    reader = new Reader(0x74000004);
  });

  it('should parse the token correctly', function(done) {

    var interfaceNumber = 1;
    var tdsVersionNumber = 0x72090002;
    var progName = 'prog';
    var progVersion = {
      major: 1,
      minor: 2,
      buildNumHi: 3,
      buildNumLow: 4
    };
    const buffer = Buffer.alloc(21);
    let offset = 0;
    buffer.writeUInt8(0xAD, offset);
    offset = 1;
    buffer.writeUInt16LE(0, offset); // write length later
    offset += 2;
    buffer.writeUInt8(interfaceNumber, offset);
    offset += 1;
    buffer.writeUInt32BE(tdsVersionNumber, offset);
    offset += 4;
    buffer.writeUInt8(progName.length, offset);
    offset += 1;
    buffer.write(progName, offset, progName.length * 2, encoding);
    offset += Buffer.byteLength(progName, encoding);
    buffer.writeUInt8(progVersion.major, offset);
    offset += 1;
    buffer.writeUInt8(progVersion.minor, offset);
    offset += 1;
    buffer.writeUInt8(progVersion.buildNumHi, offset);
    offset += 1;
    buffer.writeUInt8(progVersion.buildNumLow, offset);
    offset += 1;

    // write length
    buffer.writeUInt16LE(offset - 3, 1);
    let token;

    reader.on('data', function(loginAckToken) {
      assert.instanceOf(loginAckToken, LoginAckToken);
      token = loginAckToken;
    });

    reader.on('error', done);


    reader.on('end', function() {
      assert.strictEqual(token.interfaceNumber, interfaceNumber);
      assert.strictEqual(token.tdsVersionNumber, tdsVersionNumber);
      assert.strictEqual(token.progName, progName);
      assert.strictEqual(token.progVersion.major, progVersion.major);
      assert.strictEqual(token.progVersion.minor, progVersion.minor);
      assert.strictEqual(token.progVersion.buildNumHi, progVersion.buildNumHi);
      assert.strictEqual(token.progVersion.buildNumLow, progVersion.buildNumLow);

      done();
    });

    reader.end(buffer);
  });

});
