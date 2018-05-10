/* @flow */

const Token = require('../../token');

class ReturnStatusToken extends Token {
  value: number

  constructor(value: number) {
    super(0x79);
    this.value = value;
  }
}

module.exports = ReturnStatusToken;

ReturnStatusToken.read = require('./read');
