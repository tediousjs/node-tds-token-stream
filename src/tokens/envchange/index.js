/* @flow */

const Token = require('../../token');

class EnvchangeToken extends Token {
  oldValue: ?(string | Buffer)
  newValue: ?(string | Buffer)
  type: number

  constructor(type: number, oldValue: string, newValue: string) {
    super(0xE3);

    this.type = type;
    this.oldValue = oldValue;
    this.newValue = newValue;
  }
}

module.exports = EnvchangeToken;

EnvchangeToken.read = require('./read');
