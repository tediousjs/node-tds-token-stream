/*@flow*/

const Token = require('../../token.js');

class SSPIToken extends Token {
    SSPIBuffer : ?(string | Buffer);
    constructor() {
      super(0xED);
      this.SSPIBuffer = Buffer.alloc(0);
    }
}
module.exports = SSPIToken;
SSPIToken.read = require('./read');
