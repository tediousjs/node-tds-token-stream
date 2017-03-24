/* @flow */

const assert = require('chai').assert;
const Reader = require('../src').Reader;

describe('Parsing a COLMETADATA token', function() {
  describe('in TDS 7.0 mode', function() {
    let reader, data;

    beforeEach(function() {
      reader = new Reader(0x07000000);

      data = Buffer.alloc(17);
      data.writeUInt8(0x81, 0);

      // Number of columns
      data.writeUInt16LE(1, 1);

      // UserType
      data.writeUInt16LE(2, 3);

      // Flags
      data.writeUInt16LE(3, 5);

      // Type
      data.writeUInt8(0x30, 7);

      // ColName
      data.writeUInt8(4, 8);
      data.write('test', 9, 8, 'ucs2');
    });

    it('should parse the token correctly', function(done) {
      const tokens = [];

      reader.on('data', function(token) {
        tokens.push(token);
      });

      reader.on('error', done);

      reader.on('end', function() {
        assert.lengthOf(tokens, 1);

        const token = tokens[0];
        assert.strictEqual(1, token.count);
        assert.lengthOf(token.columns, 1);

        const column = token.columns[0];

        assert.strictEqual(2, column.userType);
        assert.strictEqual(0x30, column.typeInfo.id);
        assert.strictEqual('test', column.name);

        done();
      });

      reader.end(data);
    });
  });

  describe('in TDS 7.1 mode', function() {
    let reader, data;

    beforeEach(function() {
      reader = new Reader(0x71000001);

      data = Buffer.alloc(17);
      data.writeUInt8(0x81, 0);

      // Number of columns
      data.writeUInt16LE(1, 1);

      // UserType
      data.writeUInt16LE(2, 3);

      // Flags
      data.writeUInt16LE(3, 5);

      // Type
      data.writeUInt8(0x30, 7);

      // ColName
      data.writeUInt8(4, 8);
      data.write('test', 9, 8, 'ucs2');
    });

    it('should parse the token correctly', function(done) {
      const tokens = [];

      reader.on('data', function(token) {
        tokens.push(token);
      });

      reader.on('error', done);

      reader.on('end', function() {
        assert.lengthOf(tokens, 1);

        const token = tokens[0];
        assert.strictEqual(1, token.count);
        assert.lengthOf(token.columns, 1);

        const column = token.columns[0];

        assert.strictEqual(2, column.userType);
        assert.strictEqual(0x30, column.typeInfo.id);
        assert.strictEqual('test', column.name);

        done();
      });

      reader.end(data);
    });
  });

  describe('in TDS 7.2 mode', function() {
    let reader, data;

    beforeEach(function() {
      reader = new Reader(0x72090002);

      data = Buffer.alloc(19);
      data.writeUInt8(0x81, 0);

      // Number of columns
      data.writeUInt16LE(1, 1);

      // UserType
      data.writeUInt32LE(2, 3);

      // Flags
      data.writeUInt16LE(3, 7);

      // Type
      data.writeUInt8(0x30, 9);

      // ColName
      data.writeUInt8(4, 10);
      data.write('test', 11, 8, 'ucs2');
    });

    it('should parse the token correctly', function(done) {
      const tokens = [];

      reader.on('data', function(token) {
        tokens.push(token);
      });

      reader.on('error', done);

      reader.on('end', function() {
        assert.lengthOf(tokens, 1);

        const token = tokens[0];
        assert.strictEqual(1, token.count);
        assert.lengthOf(token.columns, 1);

        const column = token.columns[0];

        assert.strictEqual(2, column.userType);
        assert.strictEqual(0x30, column.typeInfo.id);
        assert.strictEqual('test', column.name);

        done();
      });

      reader.end(data);
    });
  });
});
