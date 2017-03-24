/* @flow */

import type Reader from '../../reader';
import type { TypeInfo } from '../../types';

function readColmetadataToken(reader: Reader) {
  if (!reader.bytesAvailable(2)) {
    return;
  }

  const count = reader.readUInt16LE(0);
  reader.consumeBytes(2);

  const token = new ColmetadataToken(count);

  reader.stash.push(token);

  return parseColumnData;
}

function parseColumnData(reader: Reader) {
  const token: ColmetadataToken = reader.stash[reader.stash.length - 1];

  if (token.count === token.columns.length) {
    reader.stash.pop();
    reader.push(token);

    return reader.nextToken;
  }

  const column = new ColumnData();
  token.columns.push(column);
  reader.stash.push(column);

  return parseUserType;
}

function parseUserType(reader: Reader) {
  if (reader.version < 0x72090002) {
    return parseUserType_7_0;
  } else {
    return parseUserType_7_2;
  }
}

function parseUserType_7_0(reader: Reader) {
  if (!reader.bytesAvailable(2)) {
    return;
  }

  const userType = reader.readUInt16LE(0);
  reader.consumeBytes(2);

  const column: ColumnData = reader.stash[reader.stash.length - 1];
  column.userType = userType;

  return parseFlags;
}

function parseUserType_7_2(reader: Reader) {
  if (!reader.bytesAvailable(4)) {
    return;
  }

  const userType = reader.readUInt32LE(0);
  reader.consumeBytes(4);

  const column: ColumnData = reader.stash[reader.stash.length - 1];
  column.userType = userType;

  return parseFlags;
}

function parseFlags(reader: Reader) {
  if (reader.version < 0x72090002) {
    return parseFlags_7_0;
  } else if (reader.version < 0x74000004) {
    return parseFlags_7_2;
  } else {
    return parseFlags_7_4;
  }
}

function parseFlags_7_0(reader: Reader) {
  if (!reader.bytesAvailable(2)) {
    return;
  }

  // TODO: Implement flag parsing
  const flags = reader.readUInt16LE(0); // eslint-disable-line no-unused-vars
  reader.consumeBytes(2);

  return parseTypeInfo;
}

function parseFlags_7_2(reader: Reader) {
  if (!reader.bytesAvailable(2)) {
    return;
  }

  // TODO: Implement flag parsing
  const flags = reader.readUInt16LE(0); // eslint-disable-line no-unused-vars
  reader.consumeBytes(2);

  return parseTypeInfo;
}

function parseFlags_7_4(reader: Reader) {
  if (!reader.bytesAvailable(2)) {
    return;
  }

  // TODO: Implement flag parsing
  const flags = reader.readUInt16LE(0); // eslint-disable-line no-unused-vars
  reader.consumeBytes(2);

  return parseTypeInfo;
}

function parseTypeInfo(reader: Reader) {
  return readTypeInfo(afterParseTypeInfo, reader);
}

function afterParseTypeInfo(reader: Reader) {
  const typeInfo: TypeInfo = reader.stash.pop();

  const column: ColumnData = reader.stash[reader.stash.length - 1];
  column.typeInfo = typeInfo;

  if (typeInfo.id === 0x22 || typeInfo.id === 0x63 || typeInfo.id === 0x23) {
    return parseTableName;
  } else {
    return parseCryptoMetaData;
  }
}

function parseTableName(reader: Reader) {
  if (!reader.bytesAvailable(1)) {
    return;
  }

  const numParts = reader.readUInt8(0);
  reader.consumeBytes(1);

  const column: ColumnData = reader.stash[reader.stash.length - 1];
  column._tableNameParts = numParts;

  return parseTableNamePart;
}

function parseTableNamePart(reader: Reader) {
  const column: ColumnData = reader.stash[reader.stash.length - 1];

  if (column.tableName.length === column._tableNameParts) {
    return parseCryptoMetaData;
  }

  if (!reader.bytesAvailable(2)) {
    return;
  }

  const byteLength = reader.readUInt16LE(0) * 2;

  if (!reader.bytesAvailable(2 + byteLength)) {
    return;
  }

  reader.readString('ucs2', 2, 2 + byteLength);
  reader.consumeBytes(2 + byteLength);

  return parseTableNamePart;
}

function parseCryptoMetaData(reader: Reader) {
  // CryptoMetaData token was introduced in TDS 7.4
  if (reader.version < 0x74000004) {
    return parseCryptoMetaData_7_0;
  } else {
    return parseCryptoMetaData_7_4;
  }
}

function parseCryptoMetaData_7_0(reader: Reader) {
  // CryptoMetaData token was introduced in TDS 7.4
  return parseColName;
}

function parseCryptoMetaData_7_4(reader: Reader) {
  // TODO: Implement this.
  return parseColName;
}

function parseColName(reader: Reader) {
  if (!reader.bytesAvailable(1)) {
    return;
  }

  const byteLength = reader.readUInt8(0) * 2;
  if (!reader.bytesAvailable(1 + byteLength)) {
    return;
  }

  const column: ColumnData = reader.stash[reader.stash.length - 1];
  column.name = reader.readString('ucs2', 1, 1 + byteLength);
  reader.consumeBytes(1 + byteLength);

  reader.stash.pop();

  return parseColumnData;
}

module.exports = readColmetadataToken;

const ColmetadataToken = require('.');
const ColumnData = ColmetadataToken.ColumnData;
const { readTypeInfo } = require('../../types');
