/* @flow */

// FlagParser can be used for TVP_COLMETADATA, ALTMETADATA, COLMETADATA, RETURNVALUE parsing
class FlagParser {
  flags: number

  constructor(flags: number) {
    this.flags = flags;
  }

  nullable() {
    return 0x0001 == (this.flags & 0x0001);
  }

  caseSensitive() {
    return 0x0002 == (this.flags & 0x0002);
  }

  updateable() {
    const value = (this.flags >> 2) & 0x0003;
    switch (value) {
      case 0:
        return 'READ-ONLY';
      case 1:
        return 'READ-WRITE';
      case 2:
        return 'UNKNOWN';
    }
  }

  identity() {
    return 0x0010 == (this.flags & 0x0010);
  }

  computed() {
    return 0x0020 == (this.flags & 0x0020);
  }

  fixedLenCLRType() {
    return 0x0100 == (this.flags & 0x0100);
  }

  sparseColumnSet() {
    return 0x0400 == (this.flags & 0x0400);
  }

  encrypted() {
    return 0x0800 == (this.flags & 0x0800);
  }

  hidden() {
    return 0x2000 == (this.flags & 0x2000);
  }

  key() {
    return 0x4000 == (this.flags & 0x4000);
  }

  nullableUnknown() {
    return 0x8000 == (this.flags & 0x8000);
  }
}

module.exports.FlagParser = FlagParser;
