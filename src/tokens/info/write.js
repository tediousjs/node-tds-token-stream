/* @flow */

import type Writer from '../../writer';
import type Token from '../../token';

function writeInfoToken(stream: Writer, token: Token) {
  if (!(token instanceof InfoToken)) {
    throw new Error('Expected instance of InfoToken');
  }

  const messageBuffer = Buffer.from(token.message, 'ucs2');
  const serverNameBuffer = Buffer.from(token.serverName, 'ucs2');
  const procNameBuffer = Buffer.from(token.procName, 'ucs2');

  const chunkLength = (stream.version < 0x72090002 ? 15 : 17) + messageBuffer.length + serverNameBuffer.length + procNameBuffer.length;
  const chunk = Buffer.alloc(chunkLength);

  // TokenType
  chunk.writeUInt8(0xAB, 0);

  // Length
  chunk.writeUInt16LE(chunkLength - 1, 1);

  // Number
  chunk.writeUInt32LE(token.number, 3);

  // State
  chunk.writeUInt8(token.state, 7);

  // Class
  chunk.writeUInt8(token.class, 8);

  let offset = 9;

  // MsgText
  chunk.writeUInt16LE(messageBuffer.length / 2, offset);
  offset += 2;
  messageBuffer.copy(chunk, offset);
  offset += messageBuffer.length;

  // ServerName
  chunk.writeUInt8(serverNameBuffer.length / 2, offset);
  offset += 1;
  serverNameBuffer.copy(chunk, offset);
  offset += serverNameBuffer.length;

  // ProcName
  chunk.writeUInt8(procNameBuffer.length / 2, offset);
  offset += 1;
  procNameBuffer.copy(chunk, offset);
  offset += procNameBuffer.length;

  // LineNumber
  if (stream.version < 0x72090002) {
    chunk.writeUInt16LE(token.lineNumber, offset);
  } else {
    chunk.writeUInt32LE(token.lineNumber, offset);
  }

  stream.push(chunk);
}

module.exports = writeInfoToken;

const InfoToken = require('.');
