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
  },
  [0x6E]: {
    id: 0x6E,
    type: 'MONEYN',
    name: 'MoneyN',
    LengthOfDataLength: 1
  },
  [0x28]: {
    id: 0x28,
    type: 'DATEN',
    name: 'Date',
    LengthOfDataLength: 1,
    fixedDataLength: 3
  },
  [0x29]: {
    id: 0x29,
    type: 'TIMEN',
    name: 'Time',
    hasScale: true,
    LengthOfDataLength: 1,
    dataLengthFromScale: true
  },
  [0x6F]: {
    id: 0x6F,
    type: 'DATETIMN',
    name: 'DateTimeN',
    LengthOfDataLength: 1
  },
  [0x2A]: {
    id: 0x2A,
    type: 'DATETIME2N',
    name: 'DateTime2',
    hasScale: true,
    LengthOfDataLength: 1,
    dataLengthFromScale: true
  },
  [0x2B]: {
    id: 0x2B,
    type: 'DATETIMEOFFSETN',
    name: 'DateTimeOffset',
    hasScale: true,
    LengthOfDataLength: 1,
    dataLengthFromScale: true
  },

  //USHORTLEN_TYPE
  [0xAF]: {
    id: 0xAF,
    type: 'BIGCHAR',
    name: 'Char',
    hasCollation: true,
    LengthOfDataLength: 2,
    maximumLength: 8000
  },

  [0xEF]: {
    id: 0xEF,
    type: 'NCHAR',
    name: 'NChar',
    hasCollation: true,
    LengthOfDataLength: 2,
    maximumLength: 4000
  },

  [0xAD]: {
    id: 0xAD,
    type: 'BIGBINARY',
    name: 'Binary',
    LengthOfDataLength: 2,
    maximumLength: 8000
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
