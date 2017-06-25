/* @flow */

const Token = require('../../token');

class SSPIToken extends Token {
  value: number

  constructor(value: number) {
    super(0x79);

    this.value = value;
  }
}

module.exports = SSPIToken;

SSPIToken.read = require('./read');
SSPIToken.write = require('./write');
