/* @flow */

// const ALTMETADATA_TOKEN = 0x88;
// const ALTROW_TOKEN = 0xD3;
// const COLMETADATA_TOKEN = 0x81;
// const COLINFO_TOKEN = 0xA5;
// const DONE_TOKEN = 0xFD;
// const DONEPROC_TOKEN = 0xFE;
// const DONEINPROC_TOKEN = 0xFF;
// const ENVCHANGE_TOKEN = 0xE3;
// const ERROR_TOKEN = 0xAA;
// const FEATUREEXTACK_TOKEN = 0xAE; // (introduced in TDS 7.4)
// const FEDAUTHINFO_TOKEN = 0xEE; // (introduced in TDS 7.4)
// const INFO_TOKEN = 0xAB;
// const LOGINACK_TOKEN = 0xAD;
// const NBCROW_TOKEN = 0xD2; // (introduced in TDS 7.3)
// const OFFSET_TOKEN = 0x78;
// const ORDER_TOKEN = 0xA9;
// const RETURNSTATUS_TOKEN = 0x79;
// const RETURNVALUE_TOKEN = 0xAC;
// const ROW_TOKEN = 0xD1;
// const SESSIONSTATE_TOKEN = 0xE4; // (introduced in TDS 7.4)
// const SSPI_TOKEN = 0xED;
// const TABNAME_TOKEN = 0xA4;

type tokenType = 0x88 | 0xD3 | 0x81 | 0xA5 | 0xFD | 0xFE | 0xFF | 0xE3 | 0xAA | 0xAE | 0xEE | 0xAB | 0xAD | 0xD2 | 0x78 | 0xA9 | 0x79 | 0xAC | 0xD1 | 0xE4 | 0xED | 0xA4

type readStep = (reader: Reader) => ?readStep;

module.exports = class Token {
  id: tokenType

  constructor(id: tokenType) {
    this.id = id;
  }

  static read: readStep
  static write: (stream: Writer, token: Token) => void
};

const Reader = require('./reader');
const Writer = require('./writer');
