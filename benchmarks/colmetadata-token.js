'use strict';

var Reader = require('../lib/reader');

var common = require('./common');

var tokenCount = 50;
var data = new Buffer(new Array(tokenCount).join('810300000000001000380269006400000000000900e7c8000904d00034046e0061006d006500000000000900e7ffff0904d000340b6400650073006300720069007000740069006f006e00'), 'hex');

common.createBenchmark({
  name: 'parsing `COLMETADATA` tokens',

  profileIterations: 3000,

  setup: function(cb) {
    cb();
  },

  exec: function(cb) {
    var count = 0;
    var reader = new Reader(0x72090002);

    reader.on('data', function(token) {
      count += 1;
    });

    reader.on('end', function() {
      if (count !== tokenCount - 1) {
        return cb(new Error('missing token'));
      }

      cb();
    });

    reader.end(data);
  },

  teardown: function(cb) {
    cb();
  }
});
