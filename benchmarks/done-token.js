'use strict';

var Reader = require('../lib/reader');

var common = require('./common');

var tokenCount = 500;
var data = new Buffer(new Array(tokenCount).join('FE0000E0000000000000000000'), 'hex');

common.createBenchmark({
  name: 'parsing `DONEPROC` tokens',

  profileIterations: 3000,

  setup: function(cb) {
    cb();
  },

  exec: function(cb) {
    var count = 0;
    var reader = new Reader(0x72090002);

    reader.on('data', function() {
      count += 1;
    });

    reader.on('end', function() {
      if (count !== 499) {
        return cb(new Error('failed - missing tokens: ' + count));
      }

      cb();
    });

    reader.end(data);
  },

  teardown: function(cb) {
    cb();
  }
});
