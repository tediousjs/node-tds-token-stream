/* @flow */

import type Reader from '../../reader';

function readReturnStatus(reader: Reader) {
  if (!reader.bytesAvailable(4)) {
    return;
  }

  const value = reader.readInt32LE(0);
  reader.consumeBytes(4);

  reader.push(new ReturnStatusToken(value));
  return reader.nextToken;
}

module.exports = readReturnStatus;

const ReturnStatusToken = require('.');
