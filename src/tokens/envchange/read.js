/* @flow */


import type Reader from '../../reader';

function readEnvchangeToken(reader: Reader) {
  if (!reader.bytesAvailable(2)) {
    return;
  }

  const length = reader.readUInt16LE(0);
  if (!reader.bytesAvailable(2 + length)) {
    return;
  }

  reader.consumeBytes(2);
  const type = reader.readUInt8(2);

  // For "Promote Transaction", there is some additional payload
  //
  if (type === 15) {
    reader.consumeBytes(1);
    if (length !== 1) {
      throw new Error('"Promote Transaction" ENVCHANGE must have length 1');
    }
    return;
  }

  switch (type) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 13:
    case 19:
      parseBVarCharEnvchange(reader, type);
      break;

    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
    case 16:
    case 17:
    case 18:
      parseBVarByteEnvchange(reader, type);
      break;

    case 20:
      parseRoutingEnvchange(reader, type);
      break;

    default:
      throw new Error('Unknown ENVCHANGE token type');
  }

  reader.consumeBytes(length);

  return reader.nextToken;
}

function parseBVarCharEnvchange(reader, type) {
  let offset = 0;

  const oldValueLength = reader.readUInt8(offset);
  offset += 1;

  const oldValue = reader.readString('utf8', offset, oldValueLength);
  offset += oldValueLength;

  const newValueLength = reader.readUInt8(offset);
  offset += 1;

  const newValue = reader.readString('utf8', offset, newValueLength);

  reader.push(new EnvchangeToken(type, oldValue, newValue));

  return reader.nextToken;
}

function parseBVarByteEnvchange(reader, type) {
  let offset = 0;

  const oldValueLength = reader.readUInt8(offset);
  offset += 1;

  const oldValue = reader.readBuffer(offset, offset + oldValueLength);
  offset += oldValueLength;

  const newValueLength = reader.readUInt8(offset);
  offset += 1;

  const newValue = reader.readBuffer(offset, offset + newValueLength);

  reader.push(new EnvchangeToken(type, oldValue, newValue));

  return reader.nextToken;
}

function parseRoutingEnvchange(reader, type) {
  let offset = 0;

  const oldValueLength = reader.readUInt8(offset);
  offset += 1;

  const oldValue = reader.readBuffer(offset, offset + oldValueLength);
  offset += oldValueLength;

  const newValueLength = reader.readUInt8(offset);
  offset += 1;

  const newValue = reader.readBuffer(offset, offset + newValueLength);

  reader.push(new EnvchangeToken(type, oldValue, newValue));

  return reader.nextToken;
}

module.exports = readEnvchangeToken;

const EnvchangeToken = require('.');
