/* @flow */

const Token = require('../../token');

class ErrorToken extends Token {
  number: number
  state: number
  class: number
  message: string
  serverName: string
  procName: string
  lineNumber: number

  constructor() {
    super(0xAA);

    this.number = 0;
    this.state = 0;
    this.class = 0;

    this.message = '';
    this.serverName = '';
    this.procName = '';

    this.lineNumber = 0;
  }
}

module.exports = ErrorToken;

ErrorToken.read = require('./read');
ErrorToken.write = require('./write');
