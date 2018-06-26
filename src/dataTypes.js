/* @flow */

const type = {
  // FIXEDLENTYPE
  [0x1F]: {
    id: 0x1F,
    type: 'NULL',
    name: 'Null'
  },
  [0x30]: {
    id: 0x30,
    type: 'INT1',
    name: 'TinyInt'
  },
  [0x32]: {
    id: 0x32,
    type: 'BIT',
    name: 'Bit'
  },
  [0x34]: {
    id: 0x34,
    type: 'INT2',
    name: 'SmallInt'
  },
  [0x38]: {
    id: 0x38,
    type: 'INT4',
    name: 'Int'
  },
  [0x3A]: {
    id: 0x3A,
    type: 'DATETIM4',
    name: 'SmallDateTime'
  },
  [0x3B]: {
    id: 0x3B,
    type: 'FLT4',
    name: 'Real'
  },
  [0x3C]: {
    id: 0x3C,
    type: 'MONEY',
    name: 'Money'
  },
  [0x3D]: {
    id: 0x3D,
    type: 'DATETIME',
    name: 'DateTime'
  },
  [0x3E]: {
    id: 0x3E,
    type: 'FLT8',
    name: 'Float'
  },
  [0x7A]: {
    id: 0x7A,
    type: 'MONEY4',
    name: 'SmallMoney'
  },
  [0x7F]: {
    id: 0x7F,
    type: 'INT8',
    name: 'BigInt'
  },

  //VARLENTYPE
  [0x24]: {
    id: 0x24,
    type: 'GUIDN',
    name: 'UniqueIdentifier',
    LengthOfDataLength: 1
  },

  [0x26]: {
    id: 0x26,
    type: 'INTN',
    name: 'IntN',
    LengthOfDataLength: 1
  },

  [0x68]: {
    id: 0x68,
    type: 'BITN',
    name: 'BitN',
    LengthOfDataLength: 1
  },

  [0x6C]: {
    id: 0x6C,
    type: 'NUMERICN',
    name: 'NumericN',
    LengthOfDataLength: 1,
    hasPrecision: true,
    hasScale: true
  },

  [0x6D]: {
    id: 0x6D,
    type: 'FLTN',
    name: 'FloatN',
    LengthOfDataLength: 1
  }
};

const typeByName = {};
var keys = Object.keys(type);
for (const key of keys) {
  typeByName[type[key].name] = type[key];
}

module.exports.TYPE = type;

// TODO: export typeByName as TYPES in index/tedious.js
// module.exports.TYPE = typeByName;
