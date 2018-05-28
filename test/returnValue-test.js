/* @flow */

const chai = require('chai');
const assert = chai.assert;
const chai_datetime = require('chai-datetime');
chai.use(chai_datetime);

const Reader = require('../src').Reader;
const ReturnValueToken = require('../src/tokens/returnvalue');

describe('Parsing a RETURNVALUE token', function() {

  const SHIFT_LEFT_32 = (1 << 16) * (1 << 16);
  const SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32;

  describe('in TDS 7.0 mode', function() {

    let reader, data, paramOrdinal, paramName, status, userType, flag, typeid, dataLength, value, offset, tempOffset, tempBuff;

    before(function() {
      paramOrdinal = 1;
      paramName = '@count';
      status = 1;
      userType = 0;
      flag = 0;
      typeid = 0x26;
      value = 4;
      tempOffset = 0;
      tempBuff = Buffer.alloc(21);
      buildDataBuffer();
    });

    beforeEach(function() {
      reader = new Reader(0x07000000);
      offset = tempOffset;
    });

    function addListners(done, token) {
      reader.on('data', function(retValToken) {
        assert.instanceOf(retValToken, ReturnValueToken);
        token = retValToken;
      });

      reader.on('end', function() {
        assert.strictEqual(token.paramOrdinal, paramOrdinal);
        assert.strictEqual(token.paramName, paramName);
        assert.strictEqual(token.status, status);
        assert.strictEqual(token.userType, userType);
        assert.strictEqual(token.typeInfo.id, typeid);
        assert.strictEqual(token.value, value);
        done();
      });
    }

    function buildDataBuffer() {
      tempBuff.writeUInt8(0xAC, tempOffset++);
      tempBuff.writeUInt16LE(paramOrdinal, tempOffset);
      tempOffset += 2;
      tempBuff.writeUInt8(paramName.length, tempOffset++);
      tempBuff.write(paramName, tempOffset, paramName.length * 2, 'ucs2');
      tempOffset += paramName.length * 2;
      tempBuff.writeUInt8(status, tempOffset++);
      tempBuff.writeUInt16LE(userType, tempOffset);
      tempOffset += 2;
      tempBuff.writeUInt16LE(flag, tempOffset);
      tempOffset += 2;
    }

    it('should parse the INTNTYPE(Int) token correctly', function(done) {
      dataLength = 4;

      data = Buffer.alloc(28);
      tempBuff.copy(data, 0, 0);
      // TYPE_INFO
      data.writeUInt8(typeid, offset++);
      data.writeUInt8(dataLength, offset++);

      // TYPE_VARBYTE
      data.writeUInt8(dataLength, offset++);
      data.writeUInt32LE(value, offset);
      const token = {};

      addListners(done, token);
      reader.end(data);
    });

    it('should throw exception on receiving non-zero flag', function(done) {
      dataLength = 4;

      data = Buffer.alloc(28);
      tempBuff.copy(data, 0, 0, offset - 2);

      // write non-zero flag
      data.writeUInt16LE(56, offset - 2);

      // TYPE_INFO
      data.writeUInt8(typeid, offset++);
      data.writeUInt8(dataLength, offset++);

      // TYPE_VARBYTE
      data.writeUInt8(dataLength, offset++);
      data.writeUInt32LE(value, offset);
      const token = {};

      addListners(done, token);
      assert.throw(() => reader.end(data), Error, 'Unknown flags in RETURNVALUE_TOKEN');
      done();
    });
  });

  describe('in TDS 7.2 mode', function() {

    describe('test INTNTYPE', function() {

      let reader, data, paramOrdinal, paramName, status, userType, flag, typeid, dataLength, value, offset, tempBuff, tempOffset;

      before(function() {
        paramOrdinal = 1;
        paramName = '@count';
        status = 1;
        userType = 0;
        flag = 0;
        typeid = 0x26;
        value = 4;
        tempOffset = 0;
        tempBuff = Buffer.alloc(23);
        buildDataBuffer();
      });

      beforeEach(function() {
        reader = new Reader(0x72090002);
        offset = tempOffset;
      });

      function addListners(done, token) {
        reader.on('data', function(retValToken) {
          assert.instanceOf(retValToken, ReturnValueToken);
          token = retValToken;
        });

        reader.on('end', function() {
          assert.strictEqual(token.paramOrdinal, paramOrdinal);
          assert.strictEqual(token.paramName, paramName);
          assert.strictEqual(token.status, status);
          assert.strictEqual(token.userType, userType);
          assert.strictEqual(token.typeInfo.id, typeid);
          assert.strictEqual(token.value, value);
          done();
        });
      }

      function buildDataBuffer() {
        tempBuff.writeUInt8(0xAC, tempOffset++);
        tempBuff.writeUInt16LE(paramOrdinal, tempOffset);
        tempOffset += 2;
        tempBuff.writeUInt8(paramName.length, tempOffset++);
        tempBuff.write(paramName, tempOffset, paramName.length * 2, 'ucs2');
        tempOffset += paramName.length * 2;
        tempBuff.writeUInt8(status, tempOffset++);
        tempBuff.writeUInt32LE(userType, tempOffset);
        tempOffset += 4;
        tempBuff.writeUInt16LE(flag, tempOffset);
        tempOffset += 2;
      }

      it('should parse the INTNTYPE(Tinyint) token correctly', function(done) {
        dataLength = 1;

        data = Buffer.alloc(27);
        tempBuff.copy(data);
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt8(dataLength, offset++);
        // TYPE_VARBYTE
        data.writeUInt8(dataLength, offset++);
        data.writeUInt8(value, offset);

        const token = {};
        addListners(done, token);

        reader.end(data);
      });

      it('should parse the INTNTYPE(smallint) token correctly', function(done) {
        dataLength = 2;

        data = Buffer.alloc(28);
        tempBuff.copy(data);
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt8(dataLength, offset++);

        // TYPE_VARBYTE
        data.writeUInt8(dataLength, offset++);
        data.writeUInt16LE(value, offset);

        const token = {};
        addListners(done, token);

        reader.end(data);
      });

      it('should parse the INTNTYPE(Int) token correctly', function(done) {
        dataLength = 4;

        data = Buffer.alloc(30);
        tempBuff.copy(data);
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt8(dataLength, offset++);

        // TYPE_VARBYTE
        data.writeUInt8(dataLength, offset++);
        data.writeUInt32LE(value, offset);
        const token = {};

        addListners(done, token);
        reader.end(data);
      });

      it('should parse the INTNTYPE(Bigint) token correctly', function(done) {
        dataLength = 8;

        data = Buffer.alloc(34);
        tempBuff.copy(data);
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt8(dataLength, offset++);

        // TYPE_VARBYTE
        data.writeUInt8(dataLength, offset++);
        // writing data as 2 separate 32bits
        data.writeUInt32LE(value, offset);
        data.writeUInt32LE(0, offset + 4);
        const token = {};

        addListners(done, token);
        reader.end(data);
      });

      it('should parse the INTNTYPE(null) token correctly', function(done) {
        dataLength = 8;
        value = null;

        data = Buffer.alloc(26);
        tempBuff.copy(data);
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt8(dataLength, offset++);

        // TYPE_VARBYTE : zero value length for null type
        data.writeUInt8(0, offset++);

        const token = {};
        addListners(done, token);

        reader.end(data);
      });
    });

    describe('test FIXEDLENTYPE', function() {
      let reader, data, paramOrdinal, paramName, status, userType, typeid, value, offset, tempBuff, tempOffset;

      before(function() {
        paramOrdinal = 1;
        paramName = '@count';
        status = 1;
        userType = 0;
        tempOffset = 0;
        tempBuff = Buffer.alloc(23);
        buildDataBuffer();
      });

      beforeEach(function() {
        reader = new Reader(0x72090002);
        offset = tempOffset;
      });


      function addListners(done, token) {
        reader.on('data', function(retValToken) {
          assert.instanceOf(retValToken, ReturnValueToken);
          token = retValToken;
        });

        reader.on('end', function() {
          assert.strictEqual(token.paramOrdinal, paramOrdinal);
          assert.strictEqual(token.paramName, paramName);
          assert.strictEqual(token.status, status);
          assert.strictEqual(token.userType, userType);
          assert.strictEqual(token.typeInfo.id, typeid);

          if (typeid == 0x3A || typeid == 0x3D) {
            // use chai-datetime package for temporal types
            assert.equalDate(token.value, value);
            assert.equalTime(token.value, value);
          }
          else {
            assert.strictEqual(token.value, value);
          }

          done();
        });
      }

      function buildDataBuffer() {
        tempBuff.writeUInt8(0xAC, tempOffset++);
        tempBuff.writeUInt16LE(paramOrdinal, tempOffset);
        tempOffset += 2;
        tempBuff.writeUInt8(paramName.length, tempOffset++);
        tempBuff.write(paramName, tempOffset, paramName.length * 2, 'ucs2');
        tempOffset += paramName.length * 2;
        tempBuff.writeUInt8(status, tempOffset++);
        tempBuff.writeUInt32LE(userType, tempOffset);
        tempOffset += 4;
        // Flag
        tempBuff.writeUInt16LE(0, tempOffset);
        tempOffset += 2;
      }

      it('should parse the NULLTYPE token correctly', function(done) {
        typeid = 0x1F;
        value = null;

        data = Buffer.alloc(24);
        tempBuff.copy(data);
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);

        // TYPE_VARBYTE
        const token = {};
        addListners(done, token);

        reader.end(data);
      });

      it('should parse the INT1TYPE/TintInt token correctly', function(done) {
        typeid = 0x30;
        value = 255;

        data = Buffer.alloc(25);
        tempBuff.copy(data);
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);

        // TYPE_VARBYTE
        data.writeUInt8(value, offset);

        const token = {};
        addListners(done, token);

        reader.end(data);
      });

      it('should parse the BITTYPE token correctly', function(done) {
        typeid = 0x32;
        value = false;

        data = Buffer.alloc(25);
        tempBuff.copy(data);
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);

        // TYPE_VARBYTE
        data.writeUInt8(value, offset);

        const token = {};
        addListners(done, token);

        reader.end(data);
      });

      it('should parse the INT2TYPE/SmallInt token correctly', function(done) {
        typeid = 0x34;
        value = 32767;

        data = Buffer.alloc(26);
        tempBuff.copy(data);
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);

        // TYPE_VARBYTE
        data.writeUInt16LE(value, offset);

        const token = {};
        addListners(done, token);

        reader.end(data);
      });

      it('should parse the INT4TYPE/Int token correctly', function(done) {
        typeid = 0x38;
        value = -2147483648;

        data = Buffer.alloc(28);
        tempBuff.copy(data);
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);

        // TYPE_VARBYTE
        data.writeInt32LE(value, offset);

        const token = {};
        addListners(done, token);

        reader.end(data);
      });

      it('should parse the INT8TYPE/BigInt token correctly', function(done) {
        typeid = 0x7F;
        // value = -2147483648;
        value = 147483648;

        data = Buffer.alloc(32);
        tempBuff.copy(data);
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);

        // TYPE_VARBYTE
        //TODO: better alternative to test bigInt value?
        data.writeInt32LE(value, offset);
        data.writeInt32LE(0, offset + 4);

        const token = {};
        addListners(done, token);

        reader.end(data);
      });

      it('should parse the DATETIM4TYPE/SmallDateTime token correctly : UTC', function(done) {
        reader.options = {};
        reader.options.useUTC = true;
        typeid = 0x3A;
        const days = 43225; // days since 1900-01-01
        const minutes = 763;
        value = new Date('2018-05-07T12:43:00.000Z');

        data = Buffer.alloc(28);
        tempBuff.copy(data);
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);

        // TYPE_VARBYTE
        data.writeUInt16LE(days, offset);
        data.writeUInt16LE(minutes, offset + 2);

        const token = {};
        addListners(done, token);

        reader.end(data);

      });

      it('should parse the DATETIM4TYPE/SmallDateTime token correctly : local time', function(done) {
        reader.options = {};
        reader.options.useUTC = false;
        typeid = 0x3A;
        const days = 43225;
        const minutes = 763;
        value = new Date('2018-05-07T12:43:00.000');

        data = Buffer.alloc(28);
        tempBuff.copy(data);
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);

        // TYPE_VARBYTE
        data.writeUInt16LE(days, offset);
        data.writeUInt16LE(minutes, offset + 2);

        const token = {};
        addListners(done, token);

        reader.end(data);

      });

      it('should parse the FLT4TYPE/Real token correctly', function(done) {
        typeid = 0x3B;
        value = 9654.2529296875;

        data = Buffer.alloc(28);
        tempBuff.copy(data);
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);

        // TYPE_VARBYTE
        data.writeFloatLE(value, offset);

        const token = {};
        addListners(done, token);

        reader.end(data);
      });

      it('should parse the FLT8TYPE/Float token correctly', function(done) {
        typeid = 0x3E;
        value = 9654.2546456567565767644;

        data = Buffer.alloc(32);
        tempBuff.copy(data);
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);

        // TYPE_VARBYTE
        data.writeDoubleLE(value, offset);

        const token = {};
        addListners(done, token);

        reader.end(data);
      });

      it('should parse the MONEYTYPE/Money token correctly', function(done) {
        typeid = 0x3C;
        value = 922337203.5807;

        const TDS_value = value * 10000;
        data = Buffer.alloc(32);
        tempBuff.copy(data);
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);

        // TYPE_VARBYTE
        data.writeInt32LE(Math.floor(TDS_value * SHIFT_RIGHT_32), offset);
        data.writeInt32LE(TDS_value & -1, offset + 4);

        const token = {};
        addListners(done, token);

        reader.end(data);
      });

      it('should parse the MONEY4TYPE/SmallMoney token correctly', function(done) {
        typeid = 0x7A;
        value = -214748.3647;

        const TDS_value = value * 10000;
        data = Buffer.alloc(28);
        tempBuff.copy(data);
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);

        // TYPE_VARBYTE
        data.writeInt32LE(TDS_value, offset);

        const token = {};
        addListners(done, token);

        reader.end(data);
      });

      it('should parse the DATETIMETYPE/DateTime token correctly', function(done) {
        reader.options = {};
        reader.options.useUTC = true;

        typeid = 0x3D;
        value = new Date('2004-05-23T14:25:10.487Z');

        const datetime = Buffer.alloc(8, 'F09400009AA0ED00', 'hex'); //'2004-05-23T14:25:10.487Z'
        data = Buffer.alloc(32);
        tempBuff.copy(data);
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);

        // TYPE_VARBYTE
        datetime.copy(data, offset);

        const token = {};
        addListners(done, token);

        reader.end(data);
      });
    });
  });

});
