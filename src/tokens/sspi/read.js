/* @flow */

import type Reader from '../../reader';

function readSSPIToken(reader: Reader) {
  if (!reader.bytesAvailable(2)) {
    return;
  }
  const length = reader.readUInt16LE(0);
  if (!reader.bytesAvailable(length)) {
    return;
  }
  reader.consumeBytes(2);

  const token = new SSPIToken();
  token.SSPIBuffer = reader.readBuffer(0, length);
  reader.consumeBytes(length);

  reader.push(token);
  return reader.nextToken;
}

module.exports = readSSPIToken;

const SSPIToken = require('.');
