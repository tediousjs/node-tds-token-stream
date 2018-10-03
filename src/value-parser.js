/* @flow */

const iconv = require('iconv-lite');
type readStep = (reader: Reader) =>?readStep;
import type { Collation } from './types';

const Reader = require('./reader');
const TYPE = require('./dataTypes').TYPE;
const guidParser = require('./guid-parser');
const MAX = (1 << 16) - 1;
const THREE_AND_A_THIRD = 3 + (1 / 3);
const MONEY_DIVISOR = 10000;
const NULL = (1 << 16) - 1;
const PLP_NULL = new Buffer([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
const DEFAULT_ENCODING = 'utf8';

function valueParse(next: readStep, reader: Reader) {
  reader.stash.push(next);
  //TODO : add readTextPointerNull
  return readDataLength;
}

function readDataLength(reader: Reader) {
  const token = reader.stash[reader.stash.length - 2];
  // s2.2.4.2.1
  switch (token.typeInfo.id & 0x30) {
    case 0x10: // xx01xxxx - s2.2.4.2.1.1
      // token.value = 0;
      reader.stash.push(0);
      //TODO: add test for this case
      return readValue;

    case 0x20: // xx10xxxx - s2.2.4.2.1.3
      // Variable length
      if (token.typeInfo.dataLength !== MAX) {
        switch (TYPE[token.typeInfo.id].LengthOfDataLength) {
          case 1: // BYTELEN
            // for RETURNVALUE_TOKEN all the flags should be zero (TDS 2.2.7.18)
            if (!reader.bytesAvailable(1)) {
              return;
            }
            reader.stash.push(reader.readUInt8(0));
            reader.consumeBytes(1);
            return readValue;
          case 2: // USHORTCHARBINLEN
            if (!reader.bytesAvailable(2)) {
              return;
            }
            reader.stash.push(reader.readUInt16LE(0));
            reader.consumeBytes(2);
            return readValue;
          case 4: // LONGLEN
            if (!reader.bytesAvailable(4)) {
              return;
            }
            reader.stash.push(reader.readUInt32LE(0));
            reader.consumeBytes(4);
            return readValue;
          default:
            console.log('Datalength parser not-implemented for ', TYPE[token.typeInfo.id].name);
        }
      }
      else {
        //TODO: add test?
        return reader.stash.pop();
      }

    case 0x30: // xx11xxxx - s2.2.4.2.1.2
      // Fixed length
      const len = 1 << ((token.typeInfo.id & 0x0C) >> 2);
      reader.stash.push(len);
      return readValue;
  }
}

function readValue(reader: Reader) {
  const dataLength = reader.stash[reader.stash.length - 1];
  const token = reader.stash[reader.stash.length - 3];

  switch (TYPE[token.typeInfo.id].name) {

    // Fixed-Length Data Types
    case 'Null':
      token.value = null;
      reader.stash.pop(); // remove dataLength
      return reader.stash.pop();

    case 'TinyInt':
      if (!reader.bytesAvailable(1)) {
        return;
      }
      token.value = reader.readUInt8(0);
      reader.consumeBytes(1);
      reader.stash.pop(); // remove dataLength
      return reader.stash.pop();

    case 'Bit':
      if (!reader.bytesAvailable(1)) {
        return;
      }
      token.value = !!reader.readUInt8(0);
      reader.consumeBytes(1);
      reader.stash.pop(); // remove dataLength
      return reader.stash.pop();

    case 'SmallInt':
      if (!reader.bytesAvailable(2)) {
        return;
      }
      token.value = reader.readInt16LE(0);
      reader.consumeBytes(2);
      reader.stash.pop(); // remove dataLength
      return reader.stash.pop();

    case 'Int':
      if (!reader.bytesAvailable(4)) {
        return;
      }
      token.value = reader.readInt32LE(0);
      reader.consumeBytes(4);
      reader.stash.pop(); // remove dataLength
      return reader.stash.pop();

    case 'BigInt':
      if (!reader.bytesAvailable(8)) {
        return;
      }
      //TODO: replace with better alternative to avoid overflow and to read -ve value
      token.value = reader.readUInt64LE(0);
      reader.consumeBytes(8);
      reader.stash.pop(); // remove dataLength
      return reader.stash.pop();

    case 'SmallDateTime':
      return readSmallDateTime;

    case 'Real':
      if (!reader.bytesAvailable(4)) {
        return;
      }
      token.value = reader.readFloatLE(0);
      reader.consumeBytes(4);
      reader.stash.pop(); // remove dataLength
      return reader.stash.pop();

    case 'Money':
      if (!reader.bytesAvailable(8)) {
        return;
      }
      return readMoney;

    case 'DateTime':
      return readDateTime;

    case 'Float':
      if (!reader.bytesAvailable(8)) {
        return;
      }
      token.value = reader.readDoubleLE(0);
      reader.consumeBytes(8);
      reader.stash.pop(); // remove dataLength
      return reader.stash.pop();

    case 'SmallMoney':
      if (!reader.bytesAvailable(4)) {
        return;
      }
      token.value = reader.readInt32LE(0) / MONEY_DIVISOR;
      reader.consumeBytes(4);
      reader.stash.pop(); // remove dataLength
      return reader.stash.pop();

    // Variable-Length Data Types
    case 'UniqueIdentifier':
      switch (dataLength) {
        case 0:
          token.value = null;
          reader.stash.pop(); // remove dataLength
          return reader.stash.pop();
        case 0x10:
          return readGUID;
        default:
          throw new Error('Unknown UniqueIdentifier length');
      }
    case 'IntN':
      switch (dataLength) {
        case 0:
          token.value = null;
          break;
        case 1: // TinyInt
          if (!reader.bytesAvailable(1)) {
            return;
          }
          token.value = reader.readUInt8(0);
          reader.consumeBytes(1);
          break;
        case 2: // SmallInt
          if (!reader.bytesAvailable(2)) {
            return;
          }
          token.value = reader.readInt16LE(0);
          reader.consumeBytes(2);
          break;
        case 4: // Int
          if (!reader.bytesAvailable(4)) {
            return;
          }
          token.value = reader.readInt32LE(0);
          reader.consumeBytes(4);
          break;
        case 8: // BigInt
          if (!reader.bytesAvailable(8)) {
            return;
          }
          // TODO: replace with better alternative to avoid overflow and to read -ve value
          token.value = reader.readUInt64LE(0);
          reader.consumeBytes(8);
          break;
        default:
          throw new Error('Unknown length for integer datatype');
      }
      reader.stash.pop(); // remove dataLength
      return reader.stash.pop();
    case 'BitN':
      switch (dataLength) {
        case 0:
          token.value = null;
          break;
        case 1:
          if (!reader.bytesAvailable(1)) {
            return;
          }
          token.value = !!reader.readUInt8(0);
          reader.consumeBytes(1);
          break;
      }
      reader.stash.pop(); // remove dataLength
      return reader.stash.pop();
    case 'NumericN':
      if (dataLength === 0) {
        token.value = null;
        reader.stash.pop(); // remove dataLength
        return reader.stash.pop();
      }
      if (!reader.bytesAvailable(dataLength)) {
        return;
      }
      let sign = reader.readUInt8(0);
      reader.consumeBytes(1);
      sign = sign === 1 ? 1 : -1;
      let value;

      switch (dataLength - 1) {
        case 4:
          value = reader.readUInt32LE(0);
          reader.consumeBytes(4);
          break;
        case 8:
          value = reader.readUNumeric64LE(0);
          reader.consumeBytes(8);
          break;
        case 12:
          value = reader.readUNumeric96LE(0);
          reader.consumeBytes(12);
          break;
        case 16:
          value = reader.readUNumeric128LE(0);
          reader.consumeBytes(16);
          break;
        default:
          throw new Error(`Unsupported numeric size ${dataLength - 1}`);
      }
      token.value = (value * sign) / Math.pow(10, token.typeInfo.scale);
      reader.stash.pop(); // remove dataLength
      return reader.stash.pop();

    case 'FloatN':
      if (!reader.bytesAvailable(dataLength)) {
        return;
      }
      switch (dataLength) {
        case 0:
          token.value = null;
          break;
        case 4:
          token.value = reader.readFloatLE(0);
          reader.consumeBytes(4);
          break;
        case 8:
          token.value = reader.readDoubleLE(0);
          reader.consumeBytes(8);
          break;
        default:
          throw new Error('Unsupported dataLength ' + dataLength + ' for FloatN');
      }
      reader.stash.pop(); // remove dataLength
      return reader.stash.pop();

    case 'MoneyN':
      if (!reader.bytesAvailable(dataLength)) {
        return;
      }
      switch (dataLength) {
        case 0:
          token.value = null;
          reader.stash.pop(); // remove dataLength
          return reader.stash.pop();
        case 4:
          token.value = reader.readInt32LE(0) / MONEY_DIVISOR;
          reader.consumeBytes(4);
          reader.stash.pop(); // remove dataLength
          return reader.stash.pop();
        case 8:
          return readMoney;
        default:
          throw new Error('Unsupported dataLength ' + dataLength + ' for MoneyN');
      }

    case 'Date':
      switch (dataLength) {
        case 0:
          token.value = null;
          reader.stash.pop(); // remove dataLength
          return reader.stash.pop();
        case 3:
          return readDateN;
        default:
          throw new Error('Unsupported dataLength ' + dataLength + ' for Date');
      }

    case 'Time':
      if (dataLength === 0) {
        token.value = null;
        reader.stash.pop(); // remove dataLength
        return reader.stash.pop();
      } else {
        return readTimeN(reader);
      }

    case 'DateTimeN':
      switch (dataLength) {
        case 0:
          token.value = null;
          reader.stash.pop(); // remove dataLength
          return reader.stash.pop();
        case 4:
          return readSmallDateTime;
        case 8:
          return readDateTime;
      }

    case 'DateTime2':
      if (dataLength === 0) {
        token.value = null;
        reader.stash.pop(); // remove dataLength
        return reader.stash.pop();
      } else {
        return readDateTime2N(reader);
      }

    case 'DateTimeOffset':
      if (dataLength === 0) {
        token.value = null;
        reader.stash.pop(); // remove dataLength
        return reader.stash.pop();
      } else {
        return readDateTimeOffset(reader);
      }

    case 'VarChar':
    case 'Char':
      if (dataLength === NULL) {
        token.value = null;
        reader.stash.pop(); // remove dataLength
        return reader.stash.pop();
      }
      else {
        return readChars;
      }

    case 'NVarChar':
    case 'NChar':
      if (dataLength === NULL) {
        token.value = null;
        reader.stash.pop(); // remove dataLength
        return reader.stash.pop();
      } else {
        return readNChars;
      }

    case 'VarBinary':
    case 'Binary':
      if (dataLength === NULL) {
        token.value = null;
        reader.stash.pop(); // remove dataLength
        return reader.stash.pop();
      } else {
        return readBinary;
      }

    case 'Image':
      if (dataLength === PLP_NULL) {
        token.value = null;
        reader.stash.pop(); // remove dataLength
        return reader.stash.pop();
      } else {
        //TODO: implement
      }
    default:
      console.log('readValue not implemented');
  }
}

function readSmallDateTime(reader: Reader) {
  if (!reader.bytesAvailable(4)) {
    return;
  }
  reader.stash.pop(); // datalength
  const token = reader.stash[reader.stash.length - 2];
  const days = reader.readUInt16LE(0);
  const minutes = reader.readUInt16LE(2);
  if (reader.options.useUTC) {
    token.value = new Date(Date.UTC(1900, 0, 1 + days, 0, minutes));
  } else {
    token.value = new Date(1900, 0, 1 + days, 0, minutes);
  }
  reader.consumeBytes(4);
  return reader.stash.pop();
}

function readDateTime(reader: Reader) {
  if (!reader.bytesAvailable(8)) {
    return;
  }
  reader.stash.pop(); // remove dataLength
  const token = reader.stash[reader.stash.length - 2];
  const days = reader.readUInt32LE(0);
  const threeHundredthsOfSecond = reader.readUInt32LE(4);
  const milliseconds = Math.round(threeHundredthsOfSecond * THREE_AND_A_THIRD);
  if (reader.options.useUTC) {
    token.value = new Date(Date.UTC(1900, 0, 1 + days, 0, 0, 0, milliseconds));
  } else {
    token.value = new Date(1900, 0, 1 + days, 0, 0, 0, milliseconds);
  }
  reader.consumeBytes(8);
  return reader.stash.pop();
}

function readTimeN(reader: Reader) {
  const token = reader.stash[reader.stash.length - 3];
  const dataLength = reader.stash[reader.stash.length - 1];
  if (!reader.bytesAvailable(dataLength)) {
    return;
  }
  token.value = readTime(dataLength, token.typeInfo.scale, reader);
  reader.consumeBytes(dataLength);
  reader.stash.pop(); // remove dataLength
  return reader.stash.pop();
}

function readTime(dataLength: number, scale: number, reader: Reader) {
  let value;
  switch (dataLength) {
    case 3:
      value = reader.readUInt24LE(0);
      break;
    case 4:
      value = reader.readUInt32LE(0);
      break;
    case 5:
      value = reader.readUInt40LE(0);
      break;
    default:
      throw new Error(`Unknown length ${dataLength} for temporal datatype`);
  }

  if (scale < 7) {
    for (let i = scale; i < 7; i++) {
      value *= 10;
    }
  }
  let date;
  if (reader.options.useUTC) {
    date = new Date(Date.UTC(1970, 0, 1, 0, 0, 0, value / 10000));
  } else {
    date = new Date(1970, 0, 1, 0, 0, 0, value / 10000);
  }

  // $FlowFixMe: suppressing this error until https://github.com/facebook/flow/issues/396 is fixed
  Object.defineProperty(date, 'nanosecondsDelta', {
    enumerable: false,
    value: (value % 10000) / Math.pow(10, 7)
  });
  return date;
}

function readDateN(reader: Reader) {
  if (!reader.bytesAvailable(3)) {
    return;
  }
  const token = reader.stash[reader.stash.length - 3];
  token.value = readDate(undefined, reader.options.useUTC, reader);
  reader.consumeBytes(3);
  reader.stash.pop(); // remove dataLength
  return reader.stash.pop();
}

function readDate(time: ?Date, useUTC: boolean, reader: Reader) {
  let value;
  const days = reader.readUInt24LE(0);
  if (useUTC) {
    value = new Date(Date.UTC(2000, 0, days - 730118, 0, 0, 0, time ? +time : 0));
  } else {
    value = new Date(2000, 0, days - 730118, time ? (time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds()) : 0);
  }
  return value;
}

function readDateTime2N(reader: Reader) {
  const dataLength = reader.stash[reader.stash.length - 1];
  if (!reader.bytesAvailable(dataLength)) {
    return;
  }
  reader.stash.pop(); // remove dataLength
  const token = reader.stash[reader.stash.length - 2];
  token.value = readDateTime2(dataLength - 3, token.typeInfo.scale, reader.options.useUTC, reader);
  return reader.stash.pop();
}

function readDateTimeOffset(reader: Reader) {
  const dataLength = reader.stash[reader.stash.length - 1];
  if (!reader.bytesAvailable(dataLength)) {
    return;
  }
  reader.stash.pop(); // remove dataLength

  const token = reader.stash[reader.stash.length - 2];
  const date = readDateTime2(dataLength - 5, token.typeInfo.scale, true, reader);
  reader.readInt16LE(0); // TODO: add implementation to handle offset
  reader.consumeBytes(2);
  token.value = date;
  return reader.stash.pop();
}

function readDateTime2(dataLength: number, scale: number, useUTC: boolean, reader: Reader) {
  const time = readTime(dataLength, scale, reader);
  reader.consumeBytes(dataLength);
  const date = readDate(time, useUTC, reader);
  reader.consumeBytes(3);
  // $FlowFixMe
  Object.defineProperty(date, 'nanosecondsDelta', {
    enumerable: false,
    // $FlowFixMe
    value: time.nanosecondsDelta
  });
  return date;
}

function readMoney(reader: Reader) {
  reader.stash.pop(); // remove dataLength
  const token = reader.stash[reader.stash.length - 2];
  const high = reader.readInt32LE(0);
  const low = reader.readUInt32LE(4);
  token.value = (low + (0x100000000 * high)) / MONEY_DIVISOR;
  reader.consumeBytes(8);
  return reader.stash.pop();
}

function readGUID(reader: Reader) {

  const dataLength = reader.stash[reader.stash.length - 1];
  if (!reader.bytesAvailable(dataLength)) {
    return;
  }
  reader.stash.pop(); // remove dataLength
  const data = reader.readBuffer(0, dataLength);

  const token = reader.stash[reader.stash.length - 2];
  token.value = guidParser.arrayToGuid(data);
  reader.consumeBytes(dataLength);
  return reader.stash.pop();
}

function readChars(reader: Reader) {
  const dataLength = reader.stash[reader.stash.length - 1];
  if (!reader.bytesAvailable(dataLength)) {
    return;
  }
  const token = reader.stash[reader.stash.length - 3];

  const data = reader.readBuffer(0, dataLength);
  const collation: Collation = token.typeInfo.collation;
  let codepage = collation.codepage;

  if (codepage == null) {
    codepage = DEFAULT_ENCODING;
  }

  token.value = iconv.decode(data, codepage);
  reader.consumeBytes(dataLength);
  reader.stash.pop(); // remove dataLength
  return reader.stash.pop();
}

function readNChars(reader: Reader) {
  const dataLength = reader.stash[reader.stash.length - 1];
  if (!reader.bytesAvailable(dataLength)) {
    return;
  }
  const token = reader.stash[reader.stash.length - 3];
  const data = reader.readBuffer(0, dataLength);
  token.value = data.toString('ucs2');
  reader.consumeBytes(dataLength);
  reader.stash.pop(); // remove dataLength
  return reader.stash.pop();
}

function readBinary(reader: Reader) {
  const dataLength = reader.stash[reader.stash.length - 1];
  if (!reader.bytesAvailable(dataLength)) {
    return;
  }
  const token = reader.stash[reader.stash.length - 3];

  token.value = reader.readBuffer(0, dataLength);
  reader.consumeBytes(dataLength);
  reader.stash.pop(); // remove dataLength
  return reader.stash.pop();
}

module.exports.valueParse = valueParse;
