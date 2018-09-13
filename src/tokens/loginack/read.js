/* @flow */

import type Reader from '../../reader';

function readLoginAckToken(reader: Reader) {
  if (!reader.bytesAvailable(2)) {
    return;
  }

  const length = reader.readUInt16LE(0);
  if (!reader.bytesAvailable(2 + length)) {
    return;
  }
  reader.consumeBytes(2);

  const token = new LoginAckToken();
  let offset = 0;
  token.interfaceNumber = reader.readUInt8(offset);
  offset += 1;

  token.tdsVersionNumber = reader.readUInt32BE(offset);
  offset += 4;

  const progNameLen = reader.readUInt8(offset) * 2;
  offset += 1;
  token.progName = reader.readString('ucs2', offset, offset + progNameLen);
  offset += progNameLen;

  token.progVersion.major = reader.readUInt8(offset);
  offset += 1;
  token.progVersion.minor = reader.readUInt8(offset);
  offset += 1;
  token.progVersion.buildNumHi = reader.readUInt8(offset);
  offset += 1;
  token.progVersion.buildNumLow = reader.readUInt8(offset);
  offset += 1;
  reader.consumeBytes(offset);

  reader.push(token);

  return reader.nextToken;
}

module.exports = readLoginAckToken;

const LoginAckToken = require('.');
