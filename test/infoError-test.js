/* @flow */

const assert = require('chai').assert;
const Reader = require('../src').Reader;
const InfoErrorToken = require('../src/tokens/infoerror');


describe('Parsing an INFO token', function() {
  const encoding = 'ucs2';
  describe('in TDS 7.4 mode', function() {
    let reader;

    beforeEach(function() {
      reader = new Reader(0x74000004);
    });

    it('should parse the token correctly', function(done) {

      const infoNumber = 3;
      const state = 4;
      const infoClass = 5;
      const message = 'message';
      const serverName = 'server';
      const procName = 'proc';
      const lineNumber = 6;

      const buffer = Buffer.alloc(51);
      let offset = 0;
      buffer.writeUInt8(0xAB, offset);
      offset = 1;
      buffer.writeUInt16LE(48, offset);
      offset += 2;
      buffer.writeUInt32LE(infoNumber, offset);
      offset += 4;
      buffer.writeUInt8(state, offset);
      offset += 1;
      buffer.writeUInt8(infoClass, offset);
      offset += 1;
      buffer.writeUInt16LE(message.length, offset);
      offset += 2;
      buffer.write(message, offset, message.length * 2, encoding);
      offset += Buffer.byteLength(message, encoding);
      buffer.writeUInt8(serverName.length, offset);
      offset += 1;
      buffer.write(serverName, offset, serverName.length * 2, encoding);
      offset += Buffer.byteLength(serverName, encoding);
      buffer.writeUInt8(procName.length, offset);
      offset += 1;
      buffer.write(procName, offset, procName.length * 2, encoding);
      offset += Buffer.byteLength(procName, encoding);
      buffer.writeUInt32LE(lineNumber, offset);

      let token;

      reader.on('data', function(infoToken) {
        assert.instanceOf(infoToken, InfoErrorToken);
        token = infoToken;
      });

      reader.on('error', done);

      reader.on('end', function() {
        assert.strictEqual(token.infoNumber, infoNumber);
        assert.strictEqual(token.state, state);
        assert.strictEqual(token.infoClass, infoClass);
        assert.strictEqual(token.message, message);
        assert.strictEqual(token.serverName, serverName);
        assert.strictEqual(token.procName, procName);
        assert.strictEqual(token.lineNumber, lineNumber);

        done();
      });

      reader.end(buffer);
    });
  });

  describe('in TDS 7.1 mode', function() {
    let reader;

    beforeEach(function() {
      reader = new Reader(0x07010000);
    });

    it('should parse the token correctly', function(done) {

      const infoNumber = 3;
      const state = 4;
      const infoClass = 5;
      const message = 'message';
      const serverName = 'server';
      const procName = 'proc';
      const lineNumber = 6;

      const buffer = Buffer.alloc(49);
      let offset = 0;
      buffer.writeUInt8(0xAB, offset);
      offset = 1;
      buffer.writeUInt16LE(46, offset);
      offset += 2;
      buffer.writeUInt32LE(infoNumber, offset);
      offset += 4;
      buffer.writeUInt8(state, offset);
      offset += 1;
      buffer.writeUInt8(infoClass, offset);
      offset += 1;
      buffer.writeUInt16LE(message.length, offset);
      offset += 2;
      buffer.write(message, offset, message.length * 2, encoding);
      offset += Buffer.byteLength(message, encoding);
      buffer.writeUInt8(serverName.length, offset);
      offset += 1;
      buffer.write(serverName, offset, serverName.length * 2, encoding);
      offset += Buffer.byteLength(serverName, encoding);
      buffer.writeUInt8(procName.length, offset);
      offset += 1;
      buffer.write(procName, offset, procName.length * 2, encoding);
      offset += Buffer.byteLength(procName, encoding);
      buffer.writeUInt16LE(lineNumber, offset);

      let token;

      reader.on('data', function(infoToken) {
        assert.instanceOf(infoToken, InfoErrorToken);
        token = infoToken;
      });

      reader.on('error', done);

      reader.on('end', function() {
        assert.strictEqual(token.infoNumber, infoNumber);
        assert.strictEqual(token.state, state);
        assert.strictEqual(token.infoClass, infoClass);
        assert.strictEqual(token.message, message);
        assert.strictEqual(token.serverName, serverName);
        assert.strictEqual(token.procName, procName);
        assert.strictEqual(token.lineNumber, lineNumber);

        done();
      });

      reader.end(buffer);
    });
  });
});
