/* @flow */

import type Reader from '../../reader';

function readDoneProcToken(reader: Reader) {
  if (reader.version >= 0x72090002) {
    return readDoneProcToken_7_2;
  } else {
    return readDoneProcToken_7_0;
  }
}

function readDoneProcToken_7_0(reader: Reader) {
  if (!reader.bytesAvailable(8)) {
    return;
  }

  const status = reader.readUInt16LE(0);
  const curCmd = reader.readUInt16LE(2);
  const rowCount = reader.readUInt32LE(4);

  reader.consumeBytes(8);
  reader.push(new DoneProcToken(status, curCmd, rowCount));

  return reader.nextToken;
}

function readDoneProcToken_7_2(reader: Reader) {
  if (!reader.bytesAvailable(12)) {
    return;
  }

  const status = reader.readUInt16LE(0);
  const curCmd = reader.readUInt16LE(2);
  const rowCount = reader.readUInt64LE(4);

  reader.consumeBytes(12);
  reader.push(new DoneProcToken(status, curCmd, rowCount));

  return reader.nextToken;
}

module.exports = readDoneProcToken;

const DoneProcToken = require('.');
