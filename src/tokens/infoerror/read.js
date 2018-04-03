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

  const infoNumber = reader.readUInt32LE(offset);
  offset += 4;

  const state = reader.readUInt8(offset);
  offset += 1;

  const infoClass = reader.readUInt8(offset);
  offset += 1;

  const messageLen = reader.readUInt16LE(offset) * 2;
  offset += 2;
  const message = reader.readString('ucs2', offset, offset + messageLen);
  offset += messageLen;

  const serverNameLen = reader.readUInt8(offset) * 2;
  offset += 1;
  const serverName = reader.readString('ucs2', offset, offset + serverNameLen);
  offset += serverNameLen;

  const procNameLen = reader.readUInt8(offset) * 2;
  offset += 1;
  const procName = reader.readString('ucs2', offset, offset + procNameLen);
  offset += procNameLen;

  let lineNumber;
  if (reader.version < 0x74000004) {
    lineNumber = reader.readUInt16LE(offset);
    offset += 2;
  } else {
    lineNumber = reader.readUInt32LE(offset);
    offset += 4;
  }

  reader.consumeBytes(offset);

  reader.push(new InfoErrorToken(infoNumber, state, infoClass, message, serverName, procName, lineNumber));
  return reader.nextToken;
}

module.exports = readInfoErrorToken;

const InfoErrorToken = require('.');
