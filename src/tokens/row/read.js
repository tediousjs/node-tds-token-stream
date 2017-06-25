/* @flow */

import type Reader from '../../reader';

function readRowToken(reader: Reader) {
  if (!reader.columnData) {
    throw new Error('Received a ROW token without having received COLMETADATA token before');
  }

  const token = new RowToken();

  reader.stash.push(token);

  return readRowAllColumnData;
}

function readRowAllColumnData(reader: Reader) {
  const token: RowToken = reader.stash[reader.stash.length];

  if (token.allColumnData.length === reader.columnMetaData.length) {
    // We're done.
  }

  const columnMetaData = reader.columnMetaData[token.allColumnData.length];

  switch (columnMetaData.typeInfo.id) {
    case 0x22:
    case 0x23:
    case 0x63:
      return readRowTextPointerAndTimestamp;

    default:
      return readRowColumnData;
  }
}

function readRowTextPointerAndTimestamp(reader: Reader) {
  if (!reader.bytesAvailable(1)) {
    return;
  }

  const textPointerLength = reader.readUInt8(0);
  if (textPointerLength && !reader.bytesAvailable(1 + textPointerLength + 8)) {
    return;
  }

  if (textPointerLength === 0) {
    return readRowAllColumnData;
  }

  const columnData: ColumnData = reader.stash[reader.stash.length];

  let offset = 1;

  columnData.textPointer = reader.readBuffer(1, offset += textPointerLength);
  columnData.timestamp = reader.readBuffer(offset, offset += 8);

  return readRowColumnData;
}

function readRowColumnData(reader: Reader) {

  return
}

module.exports = readRowToken;

const RowToken = require('.');
const ColumnData = RowToken.ColumnData;
