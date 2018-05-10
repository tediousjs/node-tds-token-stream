/* @flow */

const Token = require('../../token');

class InfoErrorToken extends Token {
  infoNumber: number
  state: number
  infoClass: number
  message: string
  serverName: string
  procName: string
  lineNumber: number

  constructor() {

    super(0xAB);
    this.infoNumber = 0;
    this.state = 0;
    this.infoClass = 0;
    this.message = '';
    this.serverName = '';
    this.procName = '';
    this.lineNumber = 0;
  }
}

module.exports = InfoErrorToken;

InfoErrorToken.read = require('./read');
