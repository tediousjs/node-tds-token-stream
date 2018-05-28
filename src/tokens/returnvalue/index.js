/* @flow */

const Token = require('../../token');
import type { TypeInfo } from '../../types';

class ReturnValueToken extends Token {
  paramOrdinal: ?number
  paramName: ?string
  status: ?number
  userType: ?number
  typeInfo: ?TypeInfo
  valueLength: ?number
  value: ?any

  constructor() {
    super(0xAC);

    this.paramOrdinal = undefined;
    this.paramName = undefined;
    this.status = undefined;
    this.userType = undefined;
    this.typeInfo = undefined;
    this.valueLength = undefined;
    this.value = undefined;
  }
}
module.exports = ReturnValueToken;

ReturnValueToken.read = require('./read');
