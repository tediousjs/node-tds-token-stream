/* @flow */

const Token = require('../../token');
import type { TypeInfo } from '../../types';

class ReturnValueToken extends Token {
  paramOrdinal: ?number
  paramName: ?string
  status: ?number
  userType: ?number
  // TODO: parser flag
  flags: {
        nullable: ?boolean,
        caseSensitive: ?boolean,
        updateable: ?boolean,
        identity: ?boolean,
        computed: ?boolean,
        reservedODBC: ?boolean,
        fixedLenCLRType: ?boolean,
        encrypted: ?boolean
    }
  typeInfo: ?TypeInfo
  valueLength: ?number
  value: ?any

  constructor() {
    super(0xAC);

    this.paramOrdinal = undefined;
    this.paramName = undefined;
    this.status = undefined;
    this.userType = undefined;
    this.flags = {
      nullable: undefined,
      caseSensitive: undefined,
      updateable: undefined,
      identity: undefined,
      computed: undefined,
      reservedODBC: undefined,
      fixedLenCLRType: undefined,
      encrypted: undefined
    };
    this.typeInfo = undefined;
    this.valueLength = undefined;
    this.value = undefined;
  }
}
module.exports = ReturnValueToken;

ReturnValueToken.read = require('./read');
