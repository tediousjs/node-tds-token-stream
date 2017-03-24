/* @flow */

const Token = require('../../token');

class DoneToken extends Token {
  more: boolean
  sqlError: boolean
  isCountValid: boolean
  attention: boolean
  serverError: boolean
  rowCount: number
  curCmd: number

  constructor() {
    super(0xFD);

    this.more = false;
    this.sqlError = false;
    this.isCountValid = false;
    this.attention = false;
    this.serverError = false;
    this.rowCount = 0;
    this.curCmd = 0;
  }
}

module.exports = DoneToken;

DoneToken.read = require('./read');
DoneToken.write = require('./write');
