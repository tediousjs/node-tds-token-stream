/* @flow */

const Token = require('../../token');

class LoginAckToken extends Token {
  length: number
  interfaceNumber: number
  tdsVersionNumber: number
  progName: string
  progVersion: {
      major: number,
      minor: number,
      buildNumHi: number,
      buildNumLow: number
    }

  constructor() {
    super(0xAD);
    this.length = 0;
    this.interfaceNumber = 0;
    this.tdsVersionNumber = 0;
    this.progName = '';
    this.progVersion = { major: 0, minor: 0, buildNumHi: 0, buildNumLow: 0 };
  }
}

module.exports = LoginAckToken;

LoginAckToken.read = require('./read');
