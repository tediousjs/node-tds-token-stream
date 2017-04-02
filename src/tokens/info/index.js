/* @flow */

const Token = require('../../token');

class InfoToken extends Token {
  number: number
  state: number
  class: number
  message: string
  serverName: string
  procName: string
  lineNumber: number

  constructor() {
    super(0xAB);

    this.number = 0;
    this.state = 0;
    this.class = 0;

    this.message = '';
    this.serverName = '';
    this.procName = '';

    this.lineNumber = 0;
  }
}

module.exports = InfoToken;

InfoToken.read = require('./read');
InfoToken.write = require('./write');
