/* @flow */

/* global Class */

const Token = require('../../token');

class ColumnData {
  textPointer: Buffer
  timestamp: Buffer
  data: Buffer
}

class RowToken extends Token {
  allColumnData: Array<ColumnData>

  constructor() {
    super(0xD1);

    this.allColumnData = [];
  }

  static ColumnData: Class<ColumnData>
}

module.exports = RowToken;
module.exports.ColumnData = ColumnData;

//RowToken.read = require('./read');
//RowToken.write = require('./write');
