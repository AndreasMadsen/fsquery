
var test = require('tap').test;
var fs = require('fs');
var fsquery = require('./fsquery.js');

var query = fsquery(1);

var thisFile = fs.readFileSync(__filename, 'utf8');

test('simple readFile', function (t) {
  query.readFile(__filename, function (err, content) {
    t.equal(err, null);
    t.ok(Buffer.isBuffer(content));
    t.equal(content.toString(), thisFile);
    t.end();
  });
});

test('simple readFile with extra argument', function (t) {
  query.readFile(__filename, 'utf8', function (err, content) {
    t.equal(err, null);
    t.type(content, 'string');
    t.equal(content, thisFile);
    t.end();
  });
});

test('simple readFile with error', function (t) {
  query.readFile('./missing', function (err, content) {
    t.equal(err.message, "ENOENT, open './missing'");
    t.end();
  });
});

test('simultaneous readFile', function (t) {
  var callOrder = [];
  var expected = [];
  var size = 300;

  for (var i = 0; i < size; i++) expected.push(i);

  for (var i = 0; i < size; i++) (function (i) {
    query.readFile(__filename, 'utf8', function (err, content) {
      callOrder.push(i);

      t.equal(content, thisFile);

      if (i === (size - 1)) {
        t.deepEqual(callOrder, expected);
        t.end();
      }
    });
  })(i);
});
