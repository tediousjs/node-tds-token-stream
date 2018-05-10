/* @flow */

const Token = require('../../token');

class OrderToken extends Token {
  columnCount: number
  orderColumns: Array<number>

  constructor(count: number) {
    super(0xA9);
    this.columnCount = count;
    this.orderColumns = [];
  }
}

module.exports = OrderToken;

OrderToken.read = require('./read');
