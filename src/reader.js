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

  stash: Array<any>

  constructor(version: 0x07000000 | 0x07010000 | 0x71000001 | 0x72090002 | 0x730A0003 | 0x730B0003 | 0x74000004) {
    super({ readableObjectMode: true });

    this.buffer = Buffer.alloc(0);
    this.version = version;
    this.position = 0;

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

  readUInt32LE(offset: number) : number {
    return this.buffer.readUInt32LE(this.position + offset);
  }

  readUInt32BE(offset: number) : number {
    return this.buffer.readUInt32BE(this.position + offset);
  }

  readUInt64LE(offset: number) {
    // TODO: This can overflow
    return 4294967296 * this.buffer.readUInt32LE(this.position + 4) + this.buffer.readUInt32LE(this.position);
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
