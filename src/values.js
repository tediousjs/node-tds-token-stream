// /* @flow */
//
// import type { readStep } from './reader';
// import type { TypeInfo } from './types';
//
// const PassThrough = require('stream').PassThrough;
// const Reader = require('./reader');
//
// function readValue(typeInfo: TypeInfo, next: readStep, reader: Reader) {
//   reader.stash.push(next);
//   reader.stash.push(typeInfo);
//
//   switch (typeInfo.id) {
//     // FIXEDLENTYPE
//     case 0x1F: // NULLTYPE
//       return readNullValue;
//
//     case 0x30: // INT1TYPE
//       return readInt1Value;
//   }
// }
//
// function readStreamValue(reader: Reader) {
//   const stream = new PassThrough();
//
//   reader.stash.push(stream);
//
// }
//
// function readStreamValueUnknownLengthPart(reader: Reader) {
//   const stream: PassThrough = reader.stash[reader.stash.length - 1];
//
//   if (!reader.bytesAvailable(4)) {
//     return;
//   }
//
//   const chunkLength = reader.readUInt32LE(0);
//   if (chunkLength === 0) {
//     reader.consumeBytes(4);
//     stream.end();
//
//     reader.stash.pop(); // stream
//     reader.stash.pop(); // typeInfo
//     return reader.stash.pop(); // next
//   }
//
//   if (!reader.bytesAvailable(4 + chunkLength)) {
//     return;
//   }
//
//   stream.write(reader.readBytes(4, chunkLength));
//   reader.consumeBytes(4);
//
//   return readStreamValueUnknownLengthPart;
// }
//
// function readRawValue(reader: Reader) {
//   const typeInfo: TypeInfo = reader.stash[reader.stash.length - 1];
//   const byteLength = typeInfo.dataLength;
//
//   if (!reader.bytesAvailable(byteLength)) {
//     return;
//   }
//
//   const rawValue = reader.readBytes(0, typeInfo.dataLength);
//   reader.consumeBytes(typeInfo.dataLength);
//
//   reader.stash.pop();
//   const next = reader.stash.pop();
//
//   reader.stash.push(rawValue);
//
//   return next;
// }
//
// function readNullValue(reader: Reader) {
//   reader.stash.pop();
//
//   const next = reader.stash.pop();
//
//   reader.stash.push(null);
//
//   return next;
// }
//
// function readInt1Value(reader: Reader) {
//   if (!reader.bytesAvailable(1)) {
//     return;
//   }
//
//   reader.stash.pop();
//
//   const next = reader.stash.pop();
//
//   const value = reader.readUInt8(0);
//   reader.consumeBytes(1);
//   reader.stash.push(value);
//
//   return next;
// }
//
// module.exports.readValue = readValue;
