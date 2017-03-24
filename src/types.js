/* @flow */

type readStep = (reader: Reader) => ?readStep;

const Reader = require('./reader');

type typeInfoId =
  // FIXEDLENTYPE
  0x1F | 0x30 | 0x32 | 0x34 | 0x38 | 0x3A | 0x3B | 0x3C | 0x3D | 0x3E | 0x7A | 0x7F |
  // BYTELEN_TYPE
  0x24 | 0x26 | 0x37 |

  // USHORTLEN_TYPE
  0xE7 |

  // LONGLEN_TYPE
  0xF1 | // XMLTYPE
  0x22 | // IMAGETYPE
  0x23 | // TEXTTYPE
  0x62 | // SSVARIANTTYPE
  0x63;  // NTEXTTYPE

class Collation {
  localeId: number

  ignoreCase: boolean
  ignoreAccent: boolean
  ignoreWidth: boolean
  ignoreKana: boolean
  binary: boolean
  binary2: boolean

  version: number
  sortId: number

  codepage: string

  constructor() {
    this.localeId = 0;

    this.ignoreCase = false;
    this.ignoreAccent = false;
    this.ignoreWidth = false;
    this.ignoreKana = false;
    this.binary = false;
    this.binary2 = false;

    this.version = 0;
    this.sortId = 0;

    this.codepage = 'CP1252';
  }

  static fromBuffer(buffer: Buffer) : Collation {
    const collation = new Collation();

    collation.localeId |= (buffer[2] & 0x0F) << 16;
    collation.localeId |= buffer[1] << 8;
    collation.localeId |= buffer[0];

    // This may not be extracting the correct nibbles in the correct order.
//    collation.flags = buffer[3] >> 4;
//    collation.flags |= buffer[2] & 0xF0;

    // This may not be extracting the correct nibble.
    collation.version = buffer[3] & 0x0F;

    collation.sortId = buffer[4];

    const codepage = undefined; //codepageBySortId[collation.sortId] || codepageByLcid[collation.lcid];
    if (codepage) {
      collation.codepage = codepage;
    }

    return collation;
  }
}

class TypeInfo {
  id: typeInfoId
  dataLength: ?number
  precision: ?number
  scale: ?number

  collation: ?Collation

  xmlDatabaseName: ?string
  xmlOwningSchema: ?string
  xmlSchemaCollection: ?string

  constructor(id: typeInfoId, dataLength: ?number, precision: ?number, scale: ?number) {
    this.id = id;
    this.dataLength = dataLength;
    this.precision = precision;
    this.scale = scale;

    this.collation = undefined;

    this.xmlDatabaseName = undefined;
    this.xmlOwningSchema = undefined;
    this.xmlSchemaCollection = undefined;
  }
}

function readTypeInfo(next: readStep, reader: Reader) {
  reader.stash.push(next);

  return readTypeId;
}

function readTypeId(reader: Reader) {
  if (!reader.bytesAvailable(1)) {
    return;
  }

  const id = reader.readUInt8(0);
  reader.consumeBytes(1);

  switch (id) {
    // FIXEDLENTYPE
    case 0x1F: // NULLTYPE
      return readFixedLengthType(id, 0, reader);

    case 0x30: // INT1TYPE
    case 0x32: // BITTYPE
      return readFixedLengthType(id, 1, reader);

    case 0x34: // INT2TYPE
      return readFixedLengthType(id, 2, reader);

    case 0x38: // INT4TYPE
    case 0x3A: // DATETIM4TYPE
    case 0x3B: // FLT4TYPE
    case 0x7A: // MONEY4TYPE
      return readFixedLengthType(id, 4, reader);

    case 0x3C: // MONEYTYPE
    case 0x3D: // DATETIMETYPE
    case 0x3E: // FLT8TYPE
    case 0x7F: // INT8TYPE
      return readFixedLengthType(id, 8, reader);

    // BYTELEN_TYPE
    case 0x24: // GUIDTYPE
      return readGuidType;

    case 0x26: // INTNTYPE
      return readIntNType;

    case 0x37: // DECIMALTYPE
      return readDecimalType;

    case 0x3F: // NUMERICTYPE
    case 0x68: // BITNTYPE
    case 0x6A: // DECIMALNTYPE
    case 0x6C: // NUMERICNTYPE
    case 0x6D: // FLTNTYPE
    case 0x6E: // MONEYNTYPE
    case 0x6F: // DATETIMNTYPE
    case 0x28: // DATENTYPE
    case 0x29: // TIMENTYPE
    case 0x2A: // DATETIME2NTYPE
    case 0x2B: // DATETIMEOFFSETNTYPE
    case 0x2F: // CHARTYPE
    case 0x27: // VARCHARTYPE
    case 0x2D: // BINARYTYPE
    case 0x25: // VARBINARYTYPE

    // USHORTLEN_TYPE
    case 0xE7:
      return readNVarCharType;

    // LONGLEN_TYPE
    case 0xF1: // XMLTYPE
      return readXmlType;
    case 0x22: // IMAGETYPE
      return readImageType;
    case 0x23:
      //return readTextType;
    case 0x62:
      //return readVariantType;
    case 0x63:
      //return readNTextType;

    default:
      throw new Error('Unknown Type! - 0x' + id.toString(16));
  }
}

function readFixedLengthType(id, dataLength: number, reader: Reader) {
  const next = reader.stash.pop();

  reader.stash.push(new TypeInfo(id, dataLength));

  return next;
}

function readGuidType(reader: Reader) {
  if (!reader.bytesAvailable(1)) {
    return;
  }

  const dataLength = reader.readUInt8(0);
  reader.consumeBytes(1);

  if (dataLength != 0x00 && dataLength != 0x10) {
    throw new Error('Invalid data length for GUIDTYPE');
  }

  const next = reader.stash.pop();
  reader.stash.push(new TypeInfo(0x24, dataLength));
  return next;
}

function readIntNType(reader: Reader) {
  if (!reader.bytesAvailable(1)) {
    return;
  }

  const dataLength = reader.readUInt8(0);
  reader.consumeBytes(1);

  if (dataLength != 0x01 && dataLength != 0x02 && dataLength != 0x04 && dataLength != 0x08) {
    throw new Error('Invalid data length for INTNTYPE');
  }

  const next = reader.stash.pop();
  reader.stash.push(new TypeInfo(0x26, dataLength));
  return next;
}

function readDecimalType(reader: Reader) {
  if (!reader.bytesAvailable(3)) {
    return;
  }

  const dataLength = reader.readUInt8(0);
  const precision = reader.readUInt8(1);
  const scale = reader.readUInt8(2);

  reader.consumeBytes(3);

  const next = reader.stash.pop();
  reader.stash.push(new TypeInfo(0x37, dataLength, precision, scale));
  return next;
}

function readNVarCharType(reader: Reader) {
  if (!reader.bytesAvailable(7)) {
    return;
  }

  const dataLength = reader.readUInt16LE(0);
  const collation = Collation.fromBuffer(reader.readBuffer(2, 5));

  reader.consumeBytes(7);

  const typeInfo = new TypeInfo(0xE7, dataLength);
  typeInfo.collation = collation;

  const next = reader.stash.pop();
  reader.stash.push(typeInfo);
  return next;
}

function readImageType(reader: Reader) {
  if (!reader.bytesAvailable(4)) {
    return;
  }

  const dataLength = reader.readUInt32LE(0);

  reader.consumeBytes(4);

  const next = reader.stash.pop();
  reader.stash.push(new TypeInfo(0x22, dataLength));
  return next;
}

function readXmlType(reader: Reader) {
  if (!reader.bytesAvailable(1)) {
    return;
  }

  const isSchemaPresent = reader.readUInt8(0);
  reader.consumeBytes(1);

  if (isSchemaPresent === 0x01) {
    reader.stash.push(new TypeInfo(0xF1));
    return readXmlTypeDatabaseName;
  }

  if (isSchemaPresent !== 0x00) {
    throw new Error('XML Type isSchemaPresent value error');
  }

  const next = reader.stash.pop();
  reader.stash.push(new TypeInfo(0xF1));
  return next;
}

function readXmlTypeDatabaseName(reader: Reader) {
  if (!reader.bytesAvailable(1)) {
    return;
  }

  const byteLength = reader.readUInt8(0) * 2;
  if (!reader.bytesAvailable(1 + byteLength)) {
    return;
  }

  const typeInfo = reader.stash[reader.stash.length - 1];
  typeInfo.xmlDatabaseName = reader.readString('ucs2', 1, 1 + byteLength);
  reader.consumeBytes(1 + byteLength);

  return readXmlTypeOwningSchema;
}

function readXmlTypeOwningSchema(reader: Reader) {
  if (!reader.bytesAvailable(1)) {
    return;
  }

  const byteLength = reader.readUInt8(0) * 2;
  if (!reader.bytesAvailable(1 + byteLength)) {
    return;
  }

  const typeInfo = reader.stash[reader.stash.length - 1];
  typeInfo.xmlOwningSchema = reader.readString('ucs2', 1, 1 + byteLength);
  reader.consumeBytes(1 + byteLength);

  return readXmlTypeSchemaCollection;
}

function readXmlTypeSchemaCollection(reader: Reader) {
  if (!reader.bytesAvailable(2)) {
    return;
  }

  const byteLength = reader.readUInt16LE(0) * 2;
  if (!reader.bytesAvailable(2 + byteLength)) {
    return;
  }

  const typeInfo = reader.stash.pop();
  typeInfo.xmlSchemaCollection = reader.readString('ucs2', 2, 2 + byteLength);
  reader.consumeBytes(2 + byteLength);

  const next = reader.stash.pop();
  reader.stash.push(typeInfo);
  return next;
}

module.exports.readTypeInfo = readTypeInfo;
module.exports.TypeInfo = TypeInfo;

/*

type typeId = 0x24 | 0x26 | 0x37;

function fromId(id: typeId) {
  switch (id) {
    case 0x24:
      return NULLTYPE;

    case 0x26:
      return INTNTYPE;

    case 0x37:
      return DECIMALTYPE;
  }
}

class FIXEDLENTYPE {
  static fixedByteLength: ?(0 | 1 | 2 | 4 | 8)
  static variableByteLength: ?(0 | 1 | 2 | 4 | 8)
  static id: typeId
}

class NULLTYPE extends FIXEDLENTYPE {
  constructor() {
    super();

    this.byteLength = 0;
  }
}

NULLTYPE.
NULLTYPE.fixedByteLength = 0;

class INT1TYPE extends FIXEDLENTYPE {
  constructor() {
    super();

    this.byteLength = 1;
  }
}

class BITTYPE extends FIXEDLENTYPE {
  constructor() {
    super();

    this.byteLength = 1;
  }
}

class INT2TYPE extends FIXEDLENTYPE {
  constructor() {
    super();

    this.byteLength = 2;
  }
}

class INT4TYPE extends FIXEDLENTYPE {
  constructor() {
    super();

    this.byteLength = 4;
  }
}

class DATETIM4TYPE extends FIXEDLENTYPE {
  constructor() {
    super();

    this.byteLength = 4;
  }
}

class FLT4TYPE extends FIXEDLENTYPE {
  constructor() {
    super();

    this.byteLength = 4;
  }
}

class MONEY4TYPE extends FIXEDLENTYPE {
  constructor() {
    super();

    this.byteLength = 4;
  }
}

class MONEYTYPE extends FIXEDLENTYPE {
  constructor() {
    super();

    this.byteLength = 8;
  }
}

class DATETIMETYPE extends FIXEDLENTYPE {
  constructor() {
    super();

    this.byteLength = 8;
  }
}

class FLT8TYPE extends FIXEDLENTYPE {
  constructor() {
    super();

    this.byteLength = 8;
  }
}

class INT8TYPE extends FIXEDLENTYPE {
  constructor() {
    super();

    this.byteLength = 8;
  }
}

class VARLENTYPE {
  byteLength: number
}

class BYTELEN_TYPE extends VARLENTYPE {
  constructor() {
    super();

    this.byteLength = 1;
  }
}

class GUIDTYPE extends BYTELEN_TYPE {}
class INTNTYPE extends BYTELEN_TYPE {}
class DECIMALTYPE extends BYTELEN_TYPE {}
class NUMERICTYPE extends BYTELEN_TYPE {}
class BITNTYPE extends BYTELEN_TYPE {}
class DECIMALNTYPE extends BYTELEN_TYPE {}
class NUMERICNTYPE extends BYTELEN_TYPE {}
class FLTNTYPE extends BYTELEN_TYPE {}
class MONEYNTYPE extends BYTELEN_TYPE {}
class DATETIMNTYPE extends BYTELEN_TYPE {}
class DATENTYPE extends BYTELEN_TYPE {}
class TIMENTYPE extends BYTELEN_TYPE {}
class DATETIME2NTYPE extends BYTELEN_TYPE {}
class DATETIMEOFFSETNTYPE extends BYTELEN_TYPE {}
class CHARTYPE extends BYTELEN_TYPE {}
class VARCHARTYPE extends BYTELEN_TYPE {}
class BINARYTYPE extends BYTELEN_TYPE {}
class VARBINARYTYPE extends BYTELEN_TYPE {}

class USHORTLEN_TYPE extends VARLENTYPE {
  byteLength: number

  constructor() {
    super();

    this.byteLength = 2;
  }
}

class BIGVARBINTYPE extends USHORTLEN_TYPE {}
class BIGVARCHRTYPE extends USHORTLEN_TYPE {}
class BIGBINARYTYPE extends USHORTLEN_TYPE {}
class BIGCHARTYPE extends USHORTLEN_TYPE {}
class NVARCHARTYPE extends USHORTLEN_TYPE {}
class NCHARTYPE extends USHORTLEN_TYPE {}

class LONGLEN_TYPE extends VARLENTYPE {
  byteLength: number

  constructor() {
    super();

    this.byteLength = 4;
  }
}

class IMAGETYPE extends LONGLEN_TYPE {}
class NTEXTTYPE extends LONGLEN_TYPE {}
class SSVARIANTTYPE extends LONGLEN_TYPE {}
class TEXTTYPE extends LONGLEN_TYPE {}
class XMLTYPE extends LONGLEN_TYPE {}

//UDTTYPE

module.exports.fromId = fromId;

module.exports.FIXEDLENTYPE = FIXEDLENTYPE;
module.exports.NULLTYPE = NULLTYPE;
module.exports.INT1TYPE = INT1TYPE;
module.exports.BITTYPE = BITTYPE;
module.exports.INT2TYPE = INT2TYPE;
module.exports.INT4TYPE = INT4TYPE;
module.exports.DATETIM4TYPE = DATETIM4TYPE;
module.exports.FLT4TYPE = FLT4TYPE;
module.exports.MONEYTYPE = MONEYTYPE;
module.exports.DATETIMETYPE = DATETIMETYPE;
module.exports.FLT8TYPE = FLT8TYPE;
module.exports.MONEY4TYPE = MONEY4TYPE;
module.exports.INT8TYPE = INT8TYPE;

module.exports.BYTELEN_TYPE = BYTELEN_TYPE;
module.exports.GUIDTYPE = GUIDTYPE;
module.exports.INTNTYPE = INTNTYPE;
module.exports.DECIMALTYPE = DECIMALTYPE;
module.exports.NUMERICTYPE = NUMERICTYPE;
module.exports.BITNTYPE = BITNTYPE;
module.exports.DECIMALNTYPE = DECIMALNTYPE;
module.exports.NUMERICNTYPE = NUMERICNTYPE;
module.exports.FLTNTYPE = FLTNTYPE;
module.exports.MONEYNTYPE = MONEYNTYPE;
module.exports.DATETIMNTYPE = DATETIMNTYPE;
module.exports.DATENTYPE = DATENTYPE;
module.exports.TIMENTYPE = TIMENTYPE;
module.exports.DATETIME2NTYPE = DATETIME2NTYPE;
module.exports.DATETIMEOFFSETNTYPE = DATETIMEOFFSETNTYPE;
module.exports.CHARTYPE = CHARTYPE;
module.exports.VARCHARTYPE = VARCHARTYPE;
module.exports.BINARYTYPE = BINARYTYPE;
module.exports.VARBINARYTYPE = VARBINARYTYPE;

module.exports.USHORTLEN_TYPE = USHORTLEN_TYPE;
module.exports.BIGVARBINTYPE = BIGVARBINTYPE;
module.exports.BIGVARCHRTYPE = BIGVARCHRTYPE;
module.exports.BIGBINARYTYPE = BIGBINARYTYPE;
module.exports.BIGCHARTYPE = BIGCHARTYPE;
module.exports.NVARCHARTYPE = NVARCHARTYPE;
module.exports.NCHARTYPE = NCHARTYPE;

module.exports.LONGLEN_TYPE = LONGLEN_TYPE;
module.exports.IMAGETYPE = IMAGETYPE;
module.exports.NTEXTTYPE = NTEXTTYPE;
module.exports.SSVARIANTTYPE = SSVARIANTTYPE;
module.exports.TEXTTYPE = TEXTTYPE;
module.exports.XMLTYPE = XMLTYPE;
*/
