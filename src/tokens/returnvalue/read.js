/* @flow */

import type Reader from '../../reader';
import type { TypeInfo } from '../../types';

function readReturnValueToken(reader: Reader) {
  if (!reader.bytesAvailable(2)) {
    return;
  }

  const token = new ReturnValueToken();
  token.paramOrdinal = reader.readUInt16LE(0);
  reader.consumeBytes(2);
  reader.stash.push(token);
  return readReturnValueParamName;
}

function readReturnValueParamName(reader: Reader) {
  if (!reader.bytesAvailable(1)) {
    return;
  }

  const paramLength = reader.readUInt8(0) * 2;
  if (!reader.bytesAvailable(1 /*paramLength*/ + paramLength + 1 /*status*/)) {
    return;
  }
  let offset = 1;

  const token: ReturnValueToken = reader.stash[reader.stash.length - 1];
  token.paramName = reader.readString('ucs2', offset, offset + paramLength);
  offset += paramLength;

  token.status = reader.readUInt8(offset);
  offset += 1;
  reader.consumeBytes(offset);

  reader.stash.push(token);
  return parseUserType;

}

function parseUserType(reader: Reader) {
  if (reader.version < 0x72090002) {
    return parseUserType_7_0;
  } else {
    return parseUserType_7_2;
  }
}

function parseUserType_7_0(reader: Reader) {
  if (!reader.bytesAvailable(2)) {
    return;
  }

  const userType = reader.readUInt16LE(0);
  reader.consumeBytes(2);

  const token: ReturnValueToken = reader.stash[reader.stash.length - 1];
  token.userType = userType;

  return parseFlags;
}

function parseUserType_7_2(reader: Reader) {
  if (!reader.bytesAvailable(4)) {
    return;
  }

  const userType = reader.readUInt32LE(0);
  reader.consumeBytes(4);

  const token: ReturnValueToken = reader.stash[reader.stash.length - 1];
  token.userType = userType;

  return parseFlags;
}

function parseFlags(reader: Reader) {
  // for RETURNVALUE_TOKEN all the flags should be zero (TDS 2.2.7.18)
  if (!reader.bytesAvailable(2)) {
    return;
  }

  const flags = reader.readUInt16LE(0); // eslint-disable-line no-unused-vars
  reader.consumeBytes(2);

  if (0 != flags)
    throw new Error('Unknown flags in RETURNVALUE_TOKEN ');

  return parseTypeInfo;
}

function parseTypeInfo(reader: Reader) {
  return readTypeInfo(parseValue, reader);
}

function parseValue(reader: Reader) {
  const typeInfo: TypeInfo = reader.stash.pop();
  const token: ReturnValueToken = reader.stash[reader.stash.length - 1];
  token.typeInfo = typeInfo;
  return valueParse(afterReadingValue, reader);
}

function afterReadingValue(reader: Reader) {
  const token: ReturnValueToken = reader.stash.pop();
  reader.push(token);
  return reader.nextToken;
}

module.exports = readReturnValueToken;
const ReturnValueToken = require('.');
const { readTypeInfo } = require('../../types');
const { valueParse } = require('../../value-parser');
