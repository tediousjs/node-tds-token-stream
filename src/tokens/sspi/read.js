/* @flow */

import type Reader from '../../reader';

function readSSPIToken(reader: Reader) {
  if (!reader.bytesAvailable(2)) {
    return;
  }

  const length = reader.readUInt16LE(0);
  if (!reader.bytesAvailable(2 + length)) {
    return;
  }

  reader.push(new SSPIToken(reader.readBuffer(2, 2 + length)));
  reader.consumeBytes(2 + length);

  return reader.nextToken;
}

module.exports = readSSPIToken;

const SSPIToken = require('.');
