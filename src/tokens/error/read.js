/* @flow */

import type Reader from '../../reader';

function readErrorToken(reader: Reader) {
  if (!reader.bytesAvailable(2)) {
    return;
  }

  const length = reader.readUInt16LE(0);

  if (!reader.bytesAvailable(length)) {
    return;
  }
  reader.consumeBytes(2);

  const token = new ErrorToken();
  token.number = reader.readUInt32LE(0);
  token.state = reader.readUInt8(4);
  token.class = reader.readUInt8(5);
  let offset = 6;
  const messageByteLength = reader.readUInt16LE(offset) * 2;
  token.message = reader.readBuffer(offset += 2, offset += messageByteLength).toString('ucs2');
  const serverNameByteLength = reader.readUInt8(offset) * 2;
  token.serverName = reader.readBuffer(offset += 1, offset += serverNameByteLength).toString('ucs2');
  const procNameByteLength = reader.readUInt8(offset) * 2;
  token.procName = reader.readBuffer(offset += 1, offset += procNameByteLength).toString('ucs2');

  if (reader.version >= 0x72090002) {
    token.lineNumber = reader.readUInt32LE(offset);
  } else {
    token.lineNumber = reader.readUInt16LE(offset);
  }
  reader.consumeBytes(length);

  reader.push(token);

  return reader.nextToken;
}

module.exports = readErrorToken;

const ErrorToken = require('.');
