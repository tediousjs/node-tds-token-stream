/* @flow */

const assert = require('chai').assert;
const Reader = require('../../src').Reader;
const ErrorToken = require('../../src/tokens/error');

describe('Reading an `ERROR` token', function() {
  let reader;

  beforeEach(function() {
    reader = new Reader(0x74000004);
  });

  it('should parse ERROR token correctly', function(done) {
    const buffer = Buffer.alloc(88);
    const num = 102;
    const state = 1;
    const clazz = 15;
    const message = 'Incorrect syntax near \'*\'.';
    const server = 'localhost';
    let offset = 0;

    buffer.writeUInt8(0xAA, offset++);
    buffer.writeUInt16LE(85, offset); // length
    offset += 2;
    buffer.writeUInt32LE(num, offset); // number
    offset += 4;
    buffer.writeUInt8(state, offset++); // state
    buffer.writeUInt8(clazz, offset++); // class
    buffer.writeUInt16LE(message.length, offset);
    offset += 2;
    buffer.write(message, offset, message.length * 2, 'ucs2'); // message
    offset += message.length * 2;
    buffer.writeUInt8(server.length, offset++);
    buffer.write(server, offset, server.length * 2, 'ucs2'); // serverName
    offset += server.length * 2;

    buffer.writeUInt8(0, offset++);
    buffer.writeUInt32LE(1, offset);
    offset += 2;

    let token;
    reader.on('data', function(retValToken) {
      assert.instanceOf(retValToken, ErrorToken);
      token = retValToken;
    });
    reader.on('end', function() {
      assert.strictEqual(num, token.number);
      assert.strictEqual(state, token.state);
      assert.strictEqual(clazz, token.class);
      assert.strictEqual(message, token.message);
      assert.strictEqual(server, token.serverName);
      done();
    });
    reader.end(buffer);
  });

  it.skip('should parse the token correctly', function(done) {
    const buffer = Buffer.from([
      0xaa,
      // Length
      0x58, 0x00,

      // Number
      0x45, 0x16, 0x00, 0x00,

      // State
      0x02,

      // Class
      0x00,

      // MsgText
      0x25, 0x00,
      0x43, 0x00, 0x68, 0x00, 0x61, 0x00, 0x6E, 0x00, 0x67, 0x00, 0x65, 0x00, 0x64, 0x00, 0x20, 0x00,
      0x64, 0x00, 0x61, 0x00, 0x74, 0x00, 0x61, 0x00, 0x62, 0x00, 0x61, 0x00, 0x73, 0x00, 0x65, 0x00,
      0x20, 0x00, 0x63, 0x00, 0x6F, 0x00, 0x6E, 0x00, 0x74, 0x00, 0x65, 0x00, 0x78, 0x00, 0x74, 0x00,
      0x20, 0x00, 0x74, 0x00, 0x6F, 0x00, 0x20, 0x00, 0x27, 0x00, 0x6D, 0x00, 0x61, 0x00, 0x73, 0x00,
      0x74, 0x00, 0x65, 0x00, 0x72, 0x00, 0x27, 0x00, 0x2E, 0x00,

      // ServerName
      0x00,

      // ProcName
      0x00,

      // LineNumber
      0x00, 0x00
    ]);

    const tokens = [];

    reader.on('data', function(token) {
      assert.instanceOf(token, ErrorToken);
      tokens.push(token);
    });

    reader.on('error', done);

    reader.on('end', function() {
      assert.lengthOf(tokens, 1);

      const token: ErrorToken = tokens[0];
      assert.strictEqual(5701, token.number);
      assert.strictEqual(2, token.state);
      assert.deepEqual("Changed database context to 'master'.", token.message);

      done();
    });

    reader.end(buffer);
  });
});
