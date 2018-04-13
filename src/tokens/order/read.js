/* @flow */

import type Reader from '../../reader';

function readOrderToken(reader: Reader) {
  if (!reader.bytesAvailable(2)) {
    return;
  }

  const length = reader.readUInt16LE(0);
  reader.consumeBytes(2);

  const token = new OrderToken(length / 2);
  reader.stash.push(token);
  return parseColumnOrder;
}

function parseColumnOrder(reader: Reader) {
  const token: OrderToken = reader.stash[reader.stash.length - 1];
  if (token.columnCount == token.orderColumns.length) {
    reader.push(token);
    return reader.nextToken;
  }

  const colNumber = reader.readUInt16LE(0);
  reader.consumeBytes(2);
  token.orderColumns.push(colNumber);
  reader.stash.push(token);
  return parseColumnOrder;
}

module.exports = readOrderToken;

const OrderToken = require('.');
