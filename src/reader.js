/* @flow */

const Transform = require('stream').Transform;

import type Token from './token';

export type readStep = (reader: Reader) => ?readStep;

function nextToken(reader) {
  if (!reader.bytesAvailable(1)) {
    return;
  }

  const type = reader.readUInt8(0);
  reader.consumeBytes(1);

  switch (type) {
    case 0xFD: return readDoneToken;
    case 0xFF: return readDoneInProcToken;
    case 0xFE: return readDoneProcToken;
    case 0x81: return readColmetadataToken;
    case 0xAA: return readErrorToken;
    case 0xAB: return readInfoErrorToken;
    case 0xAD: return readLoginAckToken;
    case 0xA9: return readOrderToken;
    case 0x79: return readReturnStatus;
    case 0xAC: return readReturnValueToken;
    default:
      console.log(reader.buffer.slice(reader.position - 1));
      throw new Error('Unknown token type ' + type.toString(16));
  }
}

const Reader = module.exports = class Reader extends Transform {
  next: readStep
  nextToken: readStep

  position: number
  buffer: Buffer
  version: number
  options: ?any // assign connection.options

  stash: Array<any>

  constructor(version: 0x07000000 | 0x07010000 | 0x71000001 | 0x72090002 | 0x730A0003 | 0x730B0003 | 0x74000004, options: ?any) {
    super({ readableObjectMode: true });

    this.buffer = Buffer.alloc(0);
    this.version = version;
    this.position = 0;
    this.options = options;

    this.stash = [];

    this.next = this.nextToken = nextToken;
  }

  consumeBytes(count: number) {
    this.position += count;
  }

  bytesAvailable(count: number) : boolean {
    return this.position + count <= this.buffer.length;
  }

  readString(encoding: 'ucs2' | 'ascii' | 'utf8', start: number, end: number) {
    return this.buffer.toString(encoding, this.position + start, this.position + end);
  }

  readBuffer(start: number, end: number) {
    return this.buffer.slice(this.position + start, this.position + end);
  }

  readUInt8(offset: number) : number {
    return this.buffer.readUInt8(this.position + offset);
  }

  readUInt16LE(offset: number) : number {
    return this.buffer.readUInt16LE(this.position + offset);
  }

  readInt16LE(offset: number) : number {
    return this.buffer.readInt16LE(this.position + offset);
  }

  readUInt24LE(offset: number) : number {
    const low = this.buffer.readUInt16LE(this.position + offset);
    const high = this.buffer.readUInt8(this.position + offset + 2);
    return low | (high << 16);
  }

  readUInt32LE(offset: number) : number {
    return this.buffer.readUInt32LE(this.position + offset);
  }

  readInt32LE(offset: number) : number {
    return this.buffer.readInt32LE(this.position + offset);
  }

  readUInt32BE(offset: number) : number {
    return this.buffer.readUInt32BE(this.position + offset);
  }

  readUInt64LE(offset: number) {
    // TODO: This can overflow
    return 4294967296 * this.buffer.readUInt32LE(this.position + 4) + this.buffer.readUInt32LE(this.position);
  }

  readInt64LE(offset: number) {
    // TODO: This can overflow
    return 4294967296 * this.buffer.readInt32LE(this.position + 4) + (this.buffer[this.position + 4] & (0x80 === 0x80 ? 1 : -1)) * this.buffer.readUInt32LE(this.position);
  }

  readFloatLE(offset: number) {
    return this.buffer.readFloatLE(this.position + offset);
  }

  readDoubleLE(offset: number) {
    return this.buffer.readDoubleLE(this.position + offset);
  }

  readUNumeric64LE(offset: number) {
    const low = this.buffer.readUInt32LE(this.position + offset);
    const high = this.buffer.readUInt32LE(this.position + offset + 4);
    return (0x100000000 * high) + low;
  }

  readUNumeric96LE(offset: number) {
    const dword1 = this.buffer.readUInt32LE(this.position + offset);
    const dword2 = this.buffer.readUInt32LE(this.position + offset + 4);
    const dword3 = this.buffer.readUInt32LE(this.position + offset + 8);
    return (dword1 + (0x100000000 * dword2) + (0x100000000 * 0x100000000 * dword3));
  }

  readUNumeric128LE(offset: number) {
    const dword1 = this.buffer.readUInt32LE(this.position + offset);
    const dword2 = this.buffer.readUInt32LE(this.position + offset + 4);
    const dword3 = this.buffer.readUInt32LE(this.position + offset + 8);
    const dword4 = this.buffer.readUInt32LE(this.position + offset + 12);
    return (dword1 + (0x100000000 * dword2) + (0x100000000 * 0x100000000 * dword3) + (0x100000000 * 0x100000000 * 0x100000000 * dword4));
  }

  _transform(chunk: Buffer | string, encoding: string | null, callback: (error: ?Error) => void) {
    if (!(chunk instanceof Buffer)) {
      return callback(new Error('Expected Buffer'));
    }

    this.buffer = Buffer.concat([ this.buffer, chunk ]);
    this.position = 0;

    try {
      let next = this.next;
      while (next = next(this)) {
        this.next = next;
      }
    } catch (e) {
      return callback(e);
    }

    callback();
  }

  _flush(callback: (error: ?Error) => void) {
    if (this.bytesAvailable(1)) {
      return callback(new Error(`stream ended while waiting for data for '${this.next.name}'`));
    }

    callback();
  }

  push: (chunk: ?(Token | Buffer | string), encoding?: string) => boolean
};

const readDoneToken = require('./tokens/done/read');
const readDoneProcToken = require('./tokens/done-proc/read');
const readDoneInProcToken = require('./tokens/done-in-proc/read');
const readColmetadataToken = require('./tokens/colmetadata/read');
const readErrorToken = require('./tokens/error/read');
const readInfoErrorToken = require('./tokens/infoerror/read');
const readLoginAckToken = require('./tokens/loginack/read');
const readOrderToken = require('./tokens/order/read');
const readReturnStatus = require('./tokens/returnStatus/read');
const readReturnValueToken = require('./tokens/returnvalue/read');
