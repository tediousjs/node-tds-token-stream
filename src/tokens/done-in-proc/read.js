/* @flow */

import type Reader from '../../reader';

function readDoneInProcToken(reader: Reader) {
  if (reader.version >= 0x72090002) {
    return readDoneInProcToken_7_2;
  } else {
    return readDoneInProcToken_7_0;
  }
}

function updateTokenFromStatus(token: DoneInProcToken, status: number) {
  token.more = !!(status & 0x1);
  token.sqlError = !!(status & 0x2);
  token.isCountValid = !!(status & 0x10);
  token.serverError = !!(status & 0x100);
}

function readDoneInProcToken_7_0(reader: Reader) {
  if (!reader.bytesAvailable(8)) {
    return;
  }

  const token = new DoneInProcToken();
  updateTokenFromStatus(token, reader.readUInt16LE(0));
  token.curCmd = reader.readUInt16LE(2);
  token.rowCount = reader.readUInt32LE(4);

  reader.consumeBytes(8);

  reader.push(token);

  return reader.nextToken;
}

function readDoneInProcToken_7_2(reader: Reader) {
  if (!reader.bytesAvailable(12)) {
    return;
  }

  const token = new DoneInProcToken();
  updateTokenFromStatus(token, reader.readUInt16LE(0));
  token.curCmd = reader.readUInt16LE(2);
  token.rowCount = reader.readUInt64LE(4);

  reader.consumeBytes(12);

  reader.push(token);

  return reader.nextToken;
}

module.exports = readDoneInProcToken;

const DoneInProcToken = require('../done-in-proc');
