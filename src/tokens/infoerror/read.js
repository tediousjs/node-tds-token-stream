/* @flow */

import type Reader from '../../reader';

function readInfoErrorToken(reader: Reader) {
  if (!reader.bytesAvailable(2)) {
    return;
  }

  const length = reader.readUInt16LE(0);

  reader.consumeBytes(2);
  if (!reader.bytesAvailable(length)) {
    return;
  }

  let offset = 0;
  const token = new InfoErrorToken();
  token.infoNumber = reader.readUInt32LE(offset);
  offset += 4;

  token.state = reader.readUInt8(offset);
  offset += 1;

  token.infoClass = reader.readUInt8(offset);
  offset += 1;

  const messageLen = reader.readUInt16LE(offset) * 2;
  offset += 2;
  token.message = reader.readString('ucs2', offset, offset + messageLen);
  offset += messageLen;

  const serverNameLen = reader.readUInt8(offset) * 2;
  offset += 1;
  token.serverName = reader.readString('ucs2', offset, offset + serverNameLen);
  offset += serverNameLen;

  const procNameLen = reader.readUInt8(offset) * 2;
  offset += 1;
  token.procName = reader.readString('ucs2', offset, offset + procNameLen);
  offset += procNameLen;

  if (reader.version < 0x74000004) {
    token.lineNumber = reader.readUInt16LE(offset);
    offset += 2;
  } else {
    token.lineNumber = reader.readUInt32LE(offset);
    offset += 4;
  }

  reader.consumeBytes(offset);

  reader.push(token);
  return reader.nextToken;
}

module.exports = readInfoErrorToken;

const InfoErrorToken = require('.');
