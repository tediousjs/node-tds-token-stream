/* @flow */

import type Reader from '../../reader';

function readReturnStatusToken(reader: Reader) {
  if (!reader.bytesAvailable(4)) {
    return;
  }

  reader.push(new ReturnStatusToken(reader.readUInt32LE(0)));
  reader.consumeBytes(4);

  return reader.nextToken;
}

module.exports = readReturnStatusToken;

const ReturnStatusToken = require('.');
