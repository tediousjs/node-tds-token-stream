/* @flow */

type readStep = (reader: Reader) =>?readStep;
const Reader = require('./reader');
const TYPE = require('./dataTypes').TYPE;
const MAX = (1 << 16) - 1;
const THREE_AND_A_THIRD = 3 + (1 / 3);
const MONEY_DIVISOR = 10000;

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
      // reader.stash.push(0);
      reader.stash.push(0);
      //TODO: test this
      return readValue;

    case 0x20: // xx10xxxx - s2.2.4.2.1.3
      // Variable length
      if (token.typeInfo.dataLength !== MAX) {
        switch (TYPE[token.typeInfo.id].LengthOfDataLength) {
          case 1:
            reader.stash.push(reader.readUInt8(0));
            reader.consumeBytes(1);
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
  const dataLength = reader.stash.pop();
  const token = reader.stash[reader.stash.length - 2];

  switch (TYPE[token.typeInfo.id].name) {

    // Fixed-Length Data Types
    case 'Null':
      token.value = null;
      return reader.stash.pop();
    case 'TinyInt':
      token.value = reader.readUInt8(0);
      reader.consumeBytes(1);
      return reader.stash.pop();
    case 'Bit':
      token.value = !!reader.readUInt8(0);
      reader.consumeBytes(1);
      return reader.stash.pop();
    case 'SmallInt':
      token.value = reader.readInt16LE(0);
      reader.consumeBytes(2);
      return reader.stash.pop();
    case 'Int':
      token.value = reader.readInt32LE(0);
      reader.consumeBytes(4);
      return reader.stash.pop();
    case 'BigInt':
      //TODO: replace with better alternative to avoid overflow and to read -ve value
      token.value = reader.readUInt64LE(0);
      reader.consumeBytes(8);
      return reader.stash.pop();
    case 'SmallDateTime':
      return readSmallDateTime;
    case 'Real':
      token.value = reader.readFloatLE(0);
      reader.consumeBytes(4);
      return reader.stash.pop();
    case 'Money':
      return readMoney;
    case 'DateTime':
      return readDateTime;
    case 'Float':
      token.value = reader.readDoubleLE(0);
      reader.consumeBytes(8);
      return reader.stash.pop();
    case 'SmallMoney':
      token.value = reader.readInt32LE(0) / MONEY_DIVISOR;
      reader.consumeBytes(4);
      return reader.stash.pop();

    // Variable-Length Data Types
    case 'IntN':
      switch (dataLength) {
        case 0:
          token.value = null;
          return reader.stash.pop();
        case 1: // TinyInt
          token.value = reader.readUInt8(0);
          reader.consumeBytes(1);
          return reader.stash.pop();
        case 2: // SmallInt
          token.value = reader.readInt16LE(0);
          reader.consumeBytes(2);
          return reader.stash.pop();
        case 4: // Int
          token.value = reader.readInt32LE(0);
          reader.consumeBytes(4);
          return reader.stash.pop();
        case 8: // BigInt
          // TODO: replace with better alternative to avoid overflow and to read -ve value
          token.value = reader.readUInt64LE(0);
          reader.consumeBytes(8);
          return reader.stash.pop();
        default:
          console.log('Unknown length');
      }
    default:
      console.log('readValue not implemented');
  }
}

function readSmallDateTime(reader: Reader) {
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

function readMoney(reader: Reader) {
  const token = reader.stash[reader.stash.length - 2];
  const high = reader.readUInt32LE(0);
  const low = reader.readUInt32LE(4);
  token.value = (low + (0x100000000 * high)) / MONEY_DIVISOR;
  reader.consumeBytes(8);
  return reader.stash.pop();
}

module.exports.valueParse = valueParse;
