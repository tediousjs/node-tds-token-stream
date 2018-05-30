/* @flow */

const Token = require('../../token');
import type { TypeInfo } from '../../types';

class ColumnData {
  userType: ?number
  name: ?string
  _tableNameParts: number
  tableName: Array<string>

  flags: {
    nullable: boolean,
    caseSensitive: boolean,
    updateable: ?string,
    identity: boolean,
    computed: ?boolean,
    fixedLenCLRType: ?boolean,
    sparseColumnSet: ?boolean,
    encrypted: ?boolean,
    hidden: ?boolean,
    key: ?boolean,
    nullableUnknown: ?boolean
  }

  typeInfo: ?TypeInfo

  constructor() {
    this.userType = undefined;
    this.name = undefined;
    this.tableName = [];
    this._tableNameParts = 0;

    this.flags = {
      nullable: false,
      caseSensitive: false,
      updateable: undefined,
      identity: false,
      computed: undefined,
      fixedLenCLRType: undefined,
      sparseColumnSet: undefined,
      encrypted: undefined,
      hidden: undefined,
      key: undefined,
      nullableUnknown: undefined
    };
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
