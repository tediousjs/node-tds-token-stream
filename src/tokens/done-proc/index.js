/* @flow */

const Token = require('../../token');

// const DONE_FINAL;
const DONE_MORE = 0x1;
const DONE_ERROR = 0x2;
// const DONE_INXACT = 0x4;
const DONE_COUNT = 0x10;
const DONE_RPCINBATCH = 0x80;
const DONE_SRVERROR = 0x100;

class DoneProcToken extends Token {
  more: boolean
  sqlError: boolean
  serverError: boolean
  rpcInBatch: boolean
  rowCount: ?number
  curCmd: number

  constructor(status: number, curCmd: number, rowCount: number) {
    super(0xFE);

    this.more = !!(status & DONE_MORE);
    this.sqlError = !!(status & DONE_ERROR);
    this.rpcInBatch = !!(status & DONE_RPCINBATCH);
    this.serverError = !!(status & DONE_SRVERROR);

    this.curCmd = curCmd;
    this.rowCount = (status & DONE_COUNT) ? rowCount : undefined;
  }
}

module.exports = DoneProcToken;
