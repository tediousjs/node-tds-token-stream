/* @flow */

const chai = require('chai');
const chai_datetime = require('chai-datetime');
chai.use(chai_datetime);
const assert = chai.assert;

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
      assert.throws(() => reader.end(data), Error, 'Unknown flags in RETURNVALUE_TOKEN');
      done();
    });
  });

  describe('in TDS 7.2 mode', function() {

    describe('test VARLENTYPE-BYTELEN', function() {

      let reader, data, paramOrdinal, paramName, status, userType, flag, typeid, dataLength, value, offset, tempBuff, tempOffset, collation;

      before(function() {
        paramOrdinal = 1;
        paramName = '@count';
        status = 1;
        userType = 0;
        flag = 0;
        tempOffset = 0;
        tempBuff = Buffer.alloc(23);
        buildDataBuffer();
      });

      beforeEach(function() {
        reader = new Reader(0x72090002);
        offset = tempOffset;
      });

      function addListners(done, token, options) {
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
          if ((value !== null) && (typeid == 0x28 || typeid == 0x6F)) {
            assert.equalDate(token.value, value);
            if (options && options.nanoSec) { assert.strictEqual(token.value.nanosecondsDelta, options.nanoSec); }
          } else if ((value !== null) && typeid == 0x29) {
            assert.equalTime(token.value, value);
          } else if ((value !== null) && (typeid == 0x2A || typeid == 0x2B)) {
            assert.equalDate(token.value, value);
            assert.equalTime(token.value, value);
            if (options && options.nanoSec) { assert.strictEqual(token.value.nanosecondsDelta, options.nanoSec); }
          } else {
            assert.deepEqual(token.value, value);
          }

          if ((value !== null) && (typeid == 0xAF && options && options.collation)) {
            assert.strictEqual(token.typeInfo.collation.localeId, options.collation.LCID);
            assert.strictEqual(token.typeInfo.collation.codepage, options.collation.codepage);
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
        tempBuff.writeUInt16LE(flag, tempOffset);
        tempOffset += 2;
      }

      it('should parse the INTNTYPE(Tinyint) token correctly', function(done) {
        dataLength = 1;
        typeid = 0x26;
        value = 4;

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
        typeid = 0x26;
        value = 4;

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
        typeid = 0x26;
        value = 4;

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
        typeid = 0x26;
        value = 4;

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
        typeid = 0x26;
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

      it('should parse the GUIDTYPE() token correctly', function(done) {
        data = Buffer.alloc(42);
        typeid = 0x24;
        dataLength = 16;

        value = '6DF72E68-AB06-4D75-AC95-16899948B81C';
        const valueAsBuffer = Buffer.from([0x68, 0x2E, 0xF7, 0x6D, 0x06, 0xAB, 0x75, 0x4D, 0xAC, 0x95, 0x16, 0x89, 0x99, 0x48, 0xB8, 0x1C]);

        tempBuff.copy(data);

        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt8(dataLength, offset++);

        // TYPE_VARBYTE
        data.writeUInt8(dataLength, offset++);
        valueAsBuffer.copy(data, offset);

        const token = {};
        addListners(done, token);

        reader.end(data);
      });

      it('should parse the GUIDTYPE()-null token correctly', function(done) {
        data = Buffer.alloc(26);
        typeid = 0x24;
        dataLength = 16;

        value = null;

        tempBuff.copy(data);
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt8(dataLength, offset++);

        // TYPE_VARBYTE
        data.writeUInt8(0, offset++);

        const token = {};
        addListners(done, token);

        reader.end(data);
      });

      it('should parse the NUMERIC token correctly : 1 <= precision <= 9', function(done) {
        data = Buffer.alloc(33);
        tempBuff.copy(data);

        typeid = 0x6C;
        const lengthInMeta = 0x11;
        const precision = 5;
        const scale = 3;
        dataLength = 5;
        const valueAsBuffer = Buffer.from([0x00, 0xC5, 0xDB, 0x00, 0x00]);
        value = -56.261;

        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt8(lengthInMeta, offset++);
        data.writeUInt8(precision, offset++);
        data.writeUInt8(scale, offset++);

        // TYPE_VARBYTE
        data.writeUInt8(dataLength, offset++);
        valueAsBuffer.copy(data, offset);
        offset += dataLength;

        const token = {};

        addListners(done, token);
        reader.end(data);
      });

      it('should parse the NUMERIC token correctly : 10 <= precision <= 19', function(done) {
        data = Buffer.alloc(37);
        tempBuff.copy(data);

        typeid = 0x6C;
        const lengthInMeta = 0x11;
        const precision = 15;
        const scale = 3;
        dataLength = 9;
        const valueAsBuffer = Buffer.from([0x01, 0xAD, 0x2F, 0x1C, 0xBD, 0x11, 0x05, 0x02, 0x00]);
        value = 568523698745.261;

        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt8(lengthInMeta, offset++);
        data.writeUInt8(precision, offset++);
        data.writeUInt8(scale, offset++);

        // TYPE_VARBYTE
        data.writeUInt8(dataLength, offset++);
        valueAsBuffer.copy(data, offset);
        offset += dataLength;

        const token = {};

        addListners(done, token);
        reader.end(data);
      });

      it('should parse the NUMERIC token correctly : 29 <= precision <= 38', function(done) {
        data = Buffer.alloc(45);
        tempBuff.copy(data);
        // 1.235236987000989e+26
        typeid = 0x6C;
        const lengthInMeta = 0x11;
        const precision = 30;
        const scale = 3;
        dataLength = 17;
        const valueAsBuffer = Buffer.from([0x01, 0x2D, 0x77, 0xCE, 0xC2, 0x9B, 0x0E, 0x61, 0x34, 0xA4, 0x68, 0x20, 0x8F, 0x01, 0x00, 0x00, 0x00]);
        value = 1.235236987000989e+26;

        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt8(lengthInMeta, offset++);
        data.writeUInt8(precision, offset++);
        data.writeUInt8(scale, offset++);

        // TYPE_VARBYTE
        data.writeUInt8(dataLength, offset++);
        valueAsBuffer.copy(data, offset);
        offset += dataLength;

        const token = {};

        addListners(done, token);
        reader.end(data);
      });

      it('should parse the BITNTYPE token correctly', function(done) {
        dataLength = 1;
        typeid = 0x68;
        const value_sent = 0;
        value = false;

        data = Buffer.alloc(27);
        tempBuff.copy(data);
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt8(dataLength, offset++);
        // TYPE_VARBYTE
        data.writeUInt8(dataLength, offset++);
        data.writeUInt8(value_sent, offset);

        const token = {};
        addListners(done, token);

        reader.end(data);
      });

      it('should parse the FLTN(7) token correctly', function(done) {
        data = Buffer.alloc(30);
        tempBuff.copy(data);

        typeid = 0x6D;
        dataLength = 4;

        const valueAsBuffer = Buffer.from([0x40, 0x88, 0x59, 0xC7]);
        value = -55688.25;

        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt8(dataLength, offset++);

        // TYPE_VARBYTE
        data.writeUInt8(dataLength, offset++);
        valueAsBuffer.copy(data, offset);
        offset += dataLength;

        const token = {};

        addListners(done, token);
        reader.end(data);
      });

      it('should parse the FLTN(15) token correctly', function(done) {
        data = Buffer.alloc(34);
        tempBuff.copy(data);

        typeid = 0x6D;
        dataLength = 8;

        const valueAsBuffer = Buffer.from([0x00, 0x00, 0x00, 0x20, 0x08, 0x31, 0xEB, 0x40]);
        value = 55688.25390625;

        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt8(dataLength, offset++);

        // TYPE_VARBYTE
        data.writeUInt8(dataLength, offset++);
        valueAsBuffer.copy(data, offset);
        offset += dataLength;

        const token = {};

        addListners(done, token);
        reader.end(data);
      });

      it('should parse the MONEYNTYPE(smallmoney) token correctly', function(done) {
        data = Buffer.alloc(30);
        tempBuff.copy(data);

        typeid = 0x6E;
        dataLength = 4;

        const valueAsBuffer = Buffer.from([0x00, 0x00, 0x00, 0x80]);
        value = -214748.3648;

        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt8(dataLength, offset++);

        // TYPE_VARBYTE
        data.writeUInt8(dataLength, offset++);
        valueAsBuffer.copy(data, offset);
        offset += dataLength;

        const token = {};
        addListners(done, token);
        reader.end(data);
      });

      it('should parse the MONEYNTYPE(money) token correctly', function(done) {
        data = Buffer.alloc(34);
        tempBuff.copy(data);

        typeid = 0x6E;
        dataLength = 8;

        const valueAsBuffer = Buffer.from([0x26, 0x05, 0xF4, 0xFF, 0x01, 0x00, 0x1A, 0x7D]);
        value = -337203685477.5807;

        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt8(dataLength, offset++);

        // TYPE_VARBYTE
        data.writeUInt8(dataLength, offset++);
        valueAsBuffer.copy(data, offset);
        offset += dataLength;

        const token = {};
        addListners(done, token);
        reader.end(data);
      });

      it('should parse the DATENTYPE token correctly', function(done) {
        reader.options = {};
        reader.options.useUTC = true;

        data = Buffer.alloc(28);
        tempBuff.copy(data);

        typeid = 0x28;
        dataLength = 3;

        const valueAsBuffer = Buffer.from([0x0A, 0x49, 0x0B]);
        value = new Date('12-10-25Z');

        // TYPE_INFO
        data.writeUInt8(typeid, offset++);

        // TYPE_VARBYTE
        data.writeUInt8(dataLength, offset++);
        valueAsBuffer.copy(data, offset);
        offset += dataLength;

        const token = {};
        addListners(done, token);
        reader.end(data);
      });

      it('should parse the DATENTYPE(null) token correctly', function(done) {
        reader.options = {};
        reader.options.useUTC = true;

        data = Buffer.alloc(25);
        tempBuff.copy(data);

        typeid = 0x28;
        dataLength = 0;
        value = null;

        // TYPE_INFO
        data.writeUInt8(typeid, offset++);

        // TYPE_VARBYTE
        data.writeUInt8(dataLength, offset++);

        const token = {};
        addListners(done, token);
        reader.end(data);
      });

      it('should parse the TIMETYPE(2) token correctly', function(done) {
        reader.options = {};
        reader.options.useUTC = true;

        data = Buffer.alloc(29);
        tempBuff.copy(data);

        typeid = 0x29;
        dataLength = 3;
        const scale = 2;

        const valueAsBuffer = Buffer.from([0x04, 0x1D, 0x45]);
        value = new Date(Date.UTC(1970, 0, 1, 12, 34, 54, 120));
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt8(scale, offset++);

        // TYPE_VARBYTE
        data.writeUInt8(dataLength, offset++);
        valueAsBuffer.copy(data, offset);
        offset += dataLength;

        const token = {};
        addListners(done, token);
        reader.end(data);
      });

      it('should parse the TIMETYPE(3) token correctly', function(done) {
        reader.options = {};
        reader.options.useUTC = true;

        data = Buffer.alloc(30);
        tempBuff.copy(data);

        typeid = 0x29;
        dataLength = 4;
        const scale = 3;

        const valueAsBuffer = Buffer.from([0x2F, 0x22, 0xB3, 0x02]);
        value = new Date(Date.UTC(1970, 0, 1, 12, 34, 54, 127));
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt8(scale, offset++);

        // TYPE_VARBYTE
        data.writeUInt8(dataLength, offset++);
        valueAsBuffer.copy(data, offset);
        offset += dataLength;

        const token = {};
        addListners(done, token);
        reader.end(data);
      });

      it('should parse the TIMETYPE(7) token correctly', function(done) {
        reader.options = {};
        reader.options.useUTC = true;

        data = Buffer.alloc(31);
        tempBuff.copy(data);

        typeid = 0x29;
        dataLength = 5;
        const scale = 7;

        // declare @tm time(7); set @tm = '12:34:54.1275523Z'
        const valueAsBuffer = Buffer.from([0x83, 0x61, 0x67, 0x75, 0x69]);

        value = new Date(Date.UTC(1970, 0, 1, 12, 34, 54, 127));
        const nanoSec = 0.0005523;

        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt8(scale, offset++);

        // TYPE_VARBYTE
        data.writeUInt8(dataLength, offset++);
        valueAsBuffer.copy(data, offset);
        offset += dataLength;

        const token = {};
        addListners(done, token, {nanoSec: nanoSec});
        reader.end(data);
      });

      it('should parse the DATETIMETYPE token correctly', function(done) {
        reader.options = {};
        reader.options.useUTC = true;

        data = Buffer.alloc(34);
        tempBuff.copy(data);

        typeid = 0x6F;
        dataLength = 8;

        // declare @tm datetime; set @tm = '2007-05-08T12:35:29.123Z'
        const valueAsBuffer = Buffer.from([0x28, 0x99, 0x00, 0x00, 0x11, 0x80, 0xCF, 0x00]);

        value = new Date(Date.UTC(2007, 4, 8, 12, 35, 29, 123));

        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt8(dataLength, offset++);

        // TYPE_VARBYTE
        data.writeUInt8(dataLength, offset++);
        valueAsBuffer.copy(data, offset);
        offset += dataLength;

        const token = {};
        addListners(done, token);
        reader.end(data);
      });

      it('should parse the DATETIMETYPE(smalldatetime) token correctly', function(done) {
        reader.options = {};
        reader.options.useUTC = true;

        data = Buffer.alloc(30);
        tempBuff.copy(data);

        typeid = 0x6F;
        dataLength = 4;

        // declare @tm smalldatetime; set @tm = '2007-05-08T12:35:29.123Z'
        const valueAsBuffer = Buffer.from([0x28, 0x99, 0xF3, 0x02]);

        value = new Date(Date.UTC(2007, 4, 8, 12, 35));

        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt8(dataLength, offset++);

        // TYPE_VARBYTE
        data.writeUInt8(dataLength, offset++);
        valueAsBuffer.copy(data, offset);
        offset += dataLength;

        const token = {};
        addListners(done, token);
        reader.end(data);
      });

      it('should parse the DATETIME2NTYPE(7) token correctly', function(done) {
        reader.options = {};
        reader.options.useUTC = true;

        data = Buffer.alloc(34);
        tempBuff.copy(data);

        typeid = 0x2A;
        dataLength = 8;
        const scale = 7;
        const nanoSec = 0.0004567;

        const valueAsBuffer = Buffer.from([0x07, 0x55, 0x43, 0x8A, 0x69, 0x83, 0x2E, 0x0B]);
        value = new Date(Date.UTC(2007, 4, 8, 12, 35, 29, 123));
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt8(scale, offset++);

        // TYPE_VARBYTE
        data.writeUInt8(dataLength, offset++);
        valueAsBuffer.copy(data, offset);
        offset += dataLength;

        const token = {};
        addListners(done, token, {nanoSec: nanoSec});
        reader.end(data);
      });

      it('should parse the DATETIME2NTYPE(4) token correctly', function(done) {
        reader.options = {};
        reader.options.useUTC = true;

        data = Buffer.alloc(33);
        tempBuff.copy(data);

        typeid = 0x2A;
        dataLength = 7;
        const scale = 4;
        const nanoSec = 0.0006;

        const valueAsBuffer = Buffer.from([0xE4, 0xAC, 0x04, 0x1B, 0x83, 0x2E, 0x0B]);
        value = new Date(Date.UTC(2007, 4, 8, 12, 35, 29, 123));
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt8(scale, offset++);

        // TYPE_VARBYTE
        data.writeUInt8(dataLength, offset++);
        valueAsBuffer.copy(data, offset);
        offset += dataLength;

        const token = {};
        addListners(done, token, {nanoSec: nanoSec});
        reader.end(data);
      });

      it('should parse the DATETIME2NTYPE token correctly', function(done) {
        reader.options = {};
        reader.options.useUTC = true;

        data = Buffer.alloc(32);
        tempBuff.copy(data);

        typeid = 0x2A;
        dataLength = 6;
        const scale = 0;
        const nanoSec = 0;

        const valueAsBuffer = Buffer.from([0x11, 0xB1, 0x00, 0x83, 0x2E, 0x0B]);
        value = new Date(Date.UTC(2007, 4, 8, 12, 35, 29));
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt8(scale, offset++);

        // TYPE_VARBYTE
        data.writeUInt8(dataLength, offset++);
        valueAsBuffer.copy(data, offset);
        offset += dataLength;

        const token = {};
        addListners(done, token, {nanoSec: nanoSec});
        reader.end(data);
      });

      it('should parse the DATETIMEOFFSETNTYPE token correctly', function(done) {
        reader.options = {};
        reader.options.useUTC = true;

        data = Buffer.alloc(34);
        tempBuff.copy(data);

        typeid = 0x2B;
        dataLength = 8;
        const scale = 0;
        const nanoSec = 0;

        const valueAsBuffer = Buffer.from([0x3A, 0xA2, 0x00, 0x0A, 0x49, 0x0B, 0x3C, 0x00]);
        // select @count = '12-10-25 12:32:10.000 +01:00'
        value = new Date(Date.UTC(2025, 11, 10, 11, 32, 10));
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt8(scale, offset++);

        // TYPE_VARBYTE
        data.writeUInt8(dataLength, offset++);
        valueAsBuffer.copy(data, offset);
        offset += dataLength;

        const token = {};
        addListners(done, token, {nanoSec: nanoSec});
        reader.end(data);
      });

      it('should parse the DATETIMEOFFSETNTYPE(7) token correctly', function(done) {
        reader.options = {};
        reader.options.useUTC = true;

        data = Buffer.alloc(36);
        tempBuff.copy(data);

        typeid = 0x2B;
        dataLength = 10;
        const scale = 7;
        const nanoSec = 0.0008741;

        const valueAsBuffer = Buffer.from([0x35, 0x36, 0x00, 0xB2, 0x60, 0x0A, 0x49, 0x0B, 0x3C, 0x00]);
        // select @count = '12-10-25 12:32:10.3218741 +01:00'
        value = new Date(Date.UTC(2025, 11, 10, 11, 32, 10, 321));
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt8(scale, offset++);

        // TYPE_VARBYTE
        data.writeUInt8(dataLength, offset++);
        valueAsBuffer.copy(data, offset);
        offset += dataLength;

        const token = {};
        addListners(done, token, {nanoSec: nanoSec});
        reader.end(data);
      });

      it('should parse the DATETIMEOFFSETNTYPE(null) token correctly', function(done) {
        reader.options = {};
        reader.options.useUTC = true;

        data = Buffer.alloc(26);
        tempBuff.copy(data);

        typeid = 0x2B;
        dataLength = 0;
        const scale = 0;

        value = null;
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt8(scale, offset++);

        // TYPE_VARBYTE
        data.writeUInt8(dataLength, offset++);
        offset += dataLength;

        const token = {};
        addListners(done, token);
        reader.end(data);
      });

      it('should parse the BIGCHARTYPE(30) -collation(CI_AI_KS_WS) token correctly', function(done) {
        data = Buffer.alloc(63);
        tempBuff.copy(data);

        typeid = 0xAF;
        dataLength = 30;

        const valueAsBuffer = Buffer.from([0x82, 0xCD, 0x82, 0xB6, 0x82, 0xDF, 0x82, 0xDC, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20]);

        value = 'はじめま                      ';
        const codePage = Buffer.from([0x11, 0x04, 0x34, 0x30, 0x00]); //Japanese_Bushu_Kakusu_140_CI_AI_KS_WS_VSS
        collation = {
          LCID: 263185,
          codepage: 'CP932'
        };

        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt16LE(dataLength, offset);
        offset += 2;

        // COLLATION + MAXLEN
        codePage.copy(data, offset);
        offset += 5;
        data.writeUInt16LE(dataLength, offset);
        offset += 2;

        // TYPE_VARBYTE
        valueAsBuffer.copy(data, offset);
        offset += dataLength;

        const token = {};
        addListners(done, token, {collation: collation});
        reader.end(data);
      });

      it('should parse the BIGCHARTYPE(30)-binary collation token correctly', function(done) {
        data = Buffer.alloc(63);
        tempBuff.copy(data);

        typeid = 0xAF;
        dataLength = 30;

        const valueAsBuffer = Buffer.from([0x61, 0x62, 0x63, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20]);
        value = 'abc                           ';
        const codePage = Buffer.from([0x09, 0x04, 0x00, 0x01, 0x1E]); //SQL_Latin1_General_Cp437_BIN
        collation = {
          LCID: 1033,
          codepage: 'CP437'
        };

        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt16LE(dataLength, offset);
        offset += 2;

        // COLLATION + MAXLEN
        codePage.copy(data, offset);
        offset += 5;
        data.writeUInt16LE(dataLength, offset);
        offset += 2;

        // TYPE_VARBYTE
        valueAsBuffer.copy(data, offset);
        offset += dataLength;

        const token = {};
        //TODO: add check for flags and LCID
        addListners(done, token, collation);
        reader.end(data);
      });

      it('should parse the BIGCHARTYPE(5000)- collation token correctly', function(done) {
        data = Buffer.alloc(4049);
        tempBuff.copy(data);
        typeid = 0xAF;
        dataLength = 5000;

        let tempB = Buffer.alloc(4016, 0x20);
        let valueAsBuffer = Buffer.from([0x73, 0x73]);
        valueAsBuffer.copy(tempB, 0, 0, 2);
        valueAsBuffer = tempB;

        value = 'ss' + ' '.repeat(4998);
        const codePage = Buffer.from([0x09, 0x04, 0xD0, 0x00, 0x34]); // Latin1_General

        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt16LE(dataLength, offset);
        offset += 2;

        // COLLATION + MAXLEN
        codePage.copy(data, offset);
        offset += 5;
        data.writeUInt16LE(dataLength, offset);
        offset += 2;

        // TYPE_VARBYTE
        valueAsBuffer.copy(data, offset);
        offset += dataLength;

        const token = {};
        //TODO: add check for flags and LCID
        addListners(done, token);
        tempB = Buffer.alloc(984, 0x20);
        reader.write(data);
        reader.write(tempB);
        reader.end();
      });

      it('should parse the NCHARTYPE(30)- token correctly', function(done) {
        data = Buffer.alloc(94);
        tempBuff.copy(data);

        typeid = 0xEF;
        dataLength = 60;

        const valueAsBuffer = Buffer.from([0x4B, 0x00, 0xF8, 0x00, 0x62, 0x00, 0x65, 0x00, 0x6E, 0x00, 0x68, 0x00, 0x61, 0x00, 0x76, 0x00, 0x6E, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0xFE]);
        value = 'København                     ';
        const codePage = Buffer.from([0x09, 0x04, 0xD0, 0x00, 0x34]);
        collation = {
          LCID: 1033,
          codepage: 'CP1252'
        };

        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt16LE(dataLength, offset);
        offset += 2;

        // COLLATION + MAXLEN
        codePage.copy(data, offset);
        offset += 5;
        data.writeUInt16LE(dataLength, offset);
        offset += 2;

        // TYPE_VARBYTE
        valueAsBuffer.copy(data, offset);
        offset += dataLength;

        const token = {};
        addListners(done, token, collation);
        reader.end(data);
      });

      it('should parse the NCHARTYPE(30)-(Japanese) token correctly', function(done) {
        data = Buffer.alloc(94);
        tempBuff.copy(data);

        typeid = 0xEF;
        dataLength = 60;

        const valueAsBuffer = Buffer.from([0x6F, 0x30, 0x58, 0x30, 0x81, 0x30, 0x7E, 0x30, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0xFE]);
        value = 'はじめま                          ';
        const codePage = Buffer.from([0x11, 0x04, 0x34, 0x30, 0x00]);
        collation = {
          LCID: 263185,
          codepage: 'CP932'
        };

        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt16LE(dataLength, offset);
        offset += 2;

        // COLLATION + MAXLEN
        codePage.copy(data, offset);
        offset += 5;
        data.writeUInt16LE(dataLength, offset);
        offset += 2;

        // TYPE_VARBYTE
        valueAsBuffer.copy(data, offset);
        offset += dataLength;

        const token = {};
        addListners(done, token, collation);
        reader.end(data);
      });

      it('should parse the BIGBINARYTYPE(10)- token correctly', function(done) {
        data = Buffer.alloc(39);
        tempBuff.copy(data);

        typeid = 0xAD;
        dataLength = 10;

        const valueAsBuffer = Buffer.from([0x56, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFE]);
        value = Buffer.from([0x56, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        data.writeUInt16LE(dataLength, offset);
        offset += 2;

        // MAXLEN
        data.writeUInt16LE(dataLength, offset);
        offset += 2;

        // TYPE_VARBYTE
        valueAsBuffer.copy(data, offset);
        offset += dataLength;

        const token = {};
        addListners(done, token);
        reader.end(data);
      });

      it('should parse the BIGVARBINARYTYPE(10)- token correctly', function(done) {
        data = Buffer.alloc(30);
        tempBuff.copy(data);

        typeid = 0xA5;
        const maxDataLength = 8000;
        dataLength = 1;

        const valueAsBuffer = Buffer.from([0x56, 0xFE]);
        value = Buffer.from([0x56]);

        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        // MAXLEN
        data.writeUInt16LE(maxDataLength, offset);
        offset += 2;
        // data length
        data.writeUInt16LE(dataLength, offset);
        offset += 2;

        // TYPE_VARBYTE
        valueAsBuffer.copy(data, offset);
        offset += dataLength;

        const token = {};
        addListners(done, token);
        reader.end(data);
      });

      it('should parse the BIGVARBINARYTYPE(10)- token correctly, null value', function(done) {
        data = Buffer.alloc(28);
        tempBuff.copy(data);

        typeid = 0xA5;
        const maxDataLength = 8000;
        dataLength = (1 << 16) - 1;
        value = null;

        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        // MAXLEN
        data.writeUInt16LE(maxDataLength, offset);
        offset += 2;

        // TYPE_VARBYTE
        data.writeUInt16LE(dataLength, offset);

        const token = {};
        addListners(done, token);
        reader.end(data);
      });

      it('should parse the BIGVARBINARYTYPE(max)- token correctly, known length value', function(done) {
        data = Buffer.alloc(44);
        tempBuff.copy(data);

        typeid = 0xA5;
        const maxDataLength = (1 << 16) - 1;
        dataLength = Buffer.from([0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
        const chukLen = 1;
        value = Buffer.from([0x55]);
        const bufferValue = 0x55;
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        // MAXLEN
        data.writeUInt16LE(maxDataLength, offset);
        offset += 2;

        // TYPE_VARBYTE
        dataLength.copy(data, offset);
        offset += 8;

        data.writeUInt32LE(chukLen, offset);
        offset += 4;
        data.writeUInt8(bufferValue, offset++);
        // PLP_TERMINATOR
        data.writeUInt32LE(0, offset);
        offset += 4;
        data.writeUInt8(0xFE, offset++);
        const token = {};
        addListners(done, token);
        reader.end(data);
      });

      it('should parse the BIGVARBINARYTYPE(max)- token correctly, known length value_2 ', function(done) {
        data = Buffer.alloc(4070);
        tempBuff.copy(data);

        const token = {};
        addListners(done, token);

        typeid = 0xA5;
        const maxDataLength = (1 << 16) - 1;
        dataLength = Buffer.from([0x88, 0x13, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
        let bufferValue = Buffer.alloc(4032, 0x55);
        value = Buffer.alloc(5000, 0x55);
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        // MAXLEN
        data.writeUInt16LE(maxDataLength, offset);
        offset += 2;

        // TYPE_VARBYTE
        dataLength.copy(data, offset);
        offset += 8;

        data.writeUInt32LE(4032, offset);
        offset += 4;
        bufferValue.copy(data, offset);
        reader.write(data);

        // chunk 2
        data = Buffer.alloc(977);
        bufferValue = Buffer.alloc(968, 0x55);
        offset = 0;
        data.writeUInt32LE(968, offset);
        offset += 4;
        bufferValue.copy(data, offset);
        offset += bufferValue.length;
        // PLP_TERMINATOR
        data.writeUInt32LE(0, offset);
        offset += 4;
        data.writeUInt8(0xFE, offset++);
        reader.write(data);
        reader.end();
      });

      it('should parse the BIGVARBINARYTYPE(max)- token correctly, UNKNOWN length value ', function(done) {
        data = Buffer.alloc(40);
        tempBuff.copy(data);

        const token = {};
        addListners(done, token);

        typeid = 0xA5;
        const maxDataLength = (1 << 16) - 1;
        dataLength = Buffer.from([0xfe, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
        value = Buffer.from([0x12, 0x34, 0x56, 0x78]);
        // TYPE_INFO
        data.writeUInt8(typeid, offset++);
        // MAXLEN
        data.writeUInt16LE(maxDataLength, offset);
        offset += 2;
        // TYPE_VARBYTE
        dataLength.copy(data, offset);
        offset += 8;

        data.writeUInt32LE(2, offset);
        offset += 4;
        value.copy(data, offset, 0, 2);
        reader.write(data);

        // chunk 2
        data = Buffer.alloc(11);
        offset = 0;
        data.writeUInt32LE(2, offset);
        offset += 4;
        value.copy(data, offset, 2, 4);
        offset += 2;
        // PLP_TERMINATOR
        data.writeUInt32LE(0, offset);
        offset += 4;
        data.writeUInt8(0xFE, offset++);
        reader.write(data);
        reader.end();
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
        data.writeUInt8(value ? 1 : 0, offset);

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
