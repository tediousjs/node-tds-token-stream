/* @flow */

const Token = require('../../token');

class DoneInProcToken extends Token {
  more: boolean
  sqlError: boolean
  isCountValid: boolean
  serverError: boolean
  rowCount: number
  curCmd: number

  constructor() {
    super(0xFF);

    this.more = false;
    this.sqlError = false;
    this.isCountValid = false;
    this.serverError = false;
    this.rowCount = 0;
    this.curCmd = 0;
  }
}

module.exports = DoneInProcToken;

DoneInProcToken.read = require('./read');
