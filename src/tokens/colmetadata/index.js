/* @flow */

const Token = require('../../token');
import type { TypeInfo } from '../../types';

class ColumnData {
  userType: ?number
  name: ?string
  _tableNameParts: number
  tableName: Array<string>

  nullable: boolean
  caseSensitive: boolean
  updateable: ?boolean
  identity: boolean

  computed: ?boolean
  sparseColumnSet: ?boolean
  encrypted: ?boolean
  fixedLenCLRType: ?boolean
  hidden: ?boolean
  key: ?boolean
  nullableUnknown: ?boolean

  typeInfo: ?TypeInfo

  constructor() {
    this.userType = undefined;
    this.name = undefined;
    this.tableName = [];
    this._tableNameParts = 0;

    this.nullable = false;
    this.caseSensitive = false;
    this.updateable = undefined;
    this.identity = false;

    this.computed = undefined;
    this.sparseColumnSet = undefined;
    this.encrypted = undefined;
    this.fixedLenCLRType = undefined;
    this.hidden = undefined;
    this.key = undefined;
    this.nullableUnknown = undefined;

    this.typeInfo = undefined;
  }
}

class ColmetadataToken extends Token {
  count: number
  columns: Array<ColumnData>

  static ColumnData: Class<ColumnData> // eslint-disable-line no-undef

//  encryptionKeyCount: number
//  encryptionKeyTable: Array<EncryptionKeyInfo>

  constructor(count: number) {
    super(0x81);

    this.count = count;
    this.columns = [];
  }
}

module.exports = ColmetadataToken;

ColmetadataToken.ColumnData = ColumnData;
ColmetadataToken.read = require('./read');
