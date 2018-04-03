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

  constructor(infoNumber: number,
        state: number,
        infoClass: number,
        message: string,
        serverName: string,
        procName: string,
        lineNumber: number) {

    super(0xAB);
    this.infoNumber = infoNumber;
    this.state = state;
    this.infoClass = infoClass;
    this.message = message;
    this.serverName = serverName;
    this.procName = procName;
    this.lineNumber = lineNumber;
  }
}

module.exports = InfoErrorToken;

InfoErrorToken.read = require('./read');
