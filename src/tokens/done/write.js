/* @flow */

import type Writer from '../../writer';
import type Token from '../../token';

function writeUInt64LE(buffer: Buffer, value: number, offset: number) : number {
  buffer.writeUInt32LE(value & 0xFFFFFFFF, offset);
  return buffer.writeUInt32LE(Math.floor(value / 0xFFFFFFFF), offset + 4);
}

function writeDoneToken(stream: Writer, token: Token) {
  if (!(token instanceof DoneToken)) {
    throw new Error('Expected instance of DoneToken');
  }

  if (stream.version >= 0x72090002) {
    writeDoneToken_7_2(stream, token);
  } else {
    writeDoneToken_7_0(stream, token);
  }
}

function statusFromToken(token) {
  let status = 0;
  if (token.more) status |= 0x1;
  if (token.error) status |= 0x2;
  if (token.isCountValid) status |= 0x10;
  if (token.attention) status |= 0x20;
  if (token.serverError) status |= 0x100;
  return status;
}

function writeDoneToken_7_0(stream: Writer, token: DoneToken) {
  const chunk = Buffer.alloc(9);

  // TokenType
  chunk.writeUInt8(0xFD, 0);

  // Status
  chunk.writeUInt16LE(statusFromToken(token), 1);

  // CurCmd
  chunk.writeUInt16LE(token.curCmd, 3);

  // DoneRowCount
  chunk.writeUInt32LE(token.rowCount || 0, 5);

  stream.push(chunk);
}

function writeDoneToken_7_2(stream: Writer, token: DoneToken) {
  const chunk = Buffer.alloc(13);

  // TokenType
  chunk.writeUInt8(0xFD, 0);

  // Status
  chunk.writeUInt16LE(statusFromToken(token), 1);

  // CurCmd
  chunk.writeUInt16LE(token.curCmd, 3);

  // DoneRowCount
  writeUInt64LE(chunk, token.rowCount || 0, 5);

  stream.push(chunk);
}

module.exports = writeDoneToken;

const DoneToken = require('.');
