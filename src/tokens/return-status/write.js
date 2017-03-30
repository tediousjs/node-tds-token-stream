/* @flow */

import type Writer from '../../writer';
import type Token from '../../token';

function writeReturnStatusToken(stream: Writer, token: Token) {
  if (!(token instanceof ReturnStatusToken)) {
    throw new Error('Expected instance of ReturnStatusToken');
  }

  const chunk = Buffer.alloc(5);

  // TokenType
  chunk.writeUInt8(0x79, 0);

  // Value
  chunk.writeUInt32LE(token.value, 1);

  stream.push(chunk);
}

module.exports = writeReturnStatusToken;

const ReturnStatusToken = require('.');
