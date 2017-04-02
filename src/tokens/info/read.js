/* @flow */

import type Reader from '../../reader';

function readInfoToken(reader: Reader) {
  if (!reader.bytesAvailable(2)) {
    return;
  }

  const length = reader.readUInt16LE(0);

  if (!reader.bytesAvailable(length)) {
    return;
  }

  const tokenData = reader.readBuffer(2, length);
  reader.consumeBytes(length);

  const token = new InfoToken();
  token.number = tokenData.readUInt32LE(0);
  token.state = tokenData.readUInt8(4);
  token.class = tokenData.readUInt8(5);

  let offset = 6;
  const messageByteLength = tokenData.readUInt16LE(offset) * 2;
  token.message = tokenData.toString('ucs2', offset += 2, offset += messageByteLength);

  const serverNameByteLength = tokenData.readUInt8(offset) * 2;
  token.serverName = tokenData.toString('ucs2', offset += 1, offset += serverNameByteLength);

  const procNameByteLength = tokenData.readUInt8(offset) * 2;
  token.procName = tokenData.toString('ucs2', offset += 1, offset += procNameByteLength);

  if (reader.version >= 0x72090002) {
    token.lineNumber = tokenData.readUInt32LE(offset);
  } else {
    token.lineNumber = tokenData.readUInt16LE(offset);
  }

  reader.push(token);

  return reader.nextToken;
}

module.exports = readInfoToken;

const InfoToken = require('.');
