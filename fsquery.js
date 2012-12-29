
var fs = require('fs');

function FSQuery(size) {
  if (!(this instanceof FSQuery)) return new FSQuery(size);

  this._query = [];
  this._active = 0;
  this._size = size;
}
module.exports = FSQuery;

// something is done
FSQuery.prototype._done = function () {
  this._active -= 1;

  // if the query is empty do nonthing
  if (this._query.length === 0) return;

  // execute next function in the query
  var next = this._query.shift();
  next();
};

// Add a function to the query
FSQuery.prototype._add = function (fn) {
  this._active += 1;

  // if the amount of active actions handlers are beound the max size, add fn
  // to the query
  if (this._active > this._size) {
    return this._query.push(fn);
  }

  // otherwice execute fn now
  fn();
};

// get all fs methods
Object.keys(fs)

  // remove sync method, constructor objects, and private methods
  .filter(function (name) {
    var lowerName = name.toLowerCase();

    return (lowerName.indexOf('sync') === -1 &&
            name.indexOf('create') === -1 &&
            lowerName[0] === name[0] &&
            name[0] !== '_');
  })
  .forEach(function (name) {
    FSQuery.prototype[name] = createWrapper(name);
  });

function createWrapper(name) {
  return function () {
    var self = this;
    var args = Array.prototype.slice.call(arguments);

    this._add(function () {
      // No callback, just pass the arguments and let it throw
      if (typeof args[args.length - 1] !== 'function') {
        return fs[name].apply(fs, args);
      }

      // replace callback with function there calls this._done
      var cb = args.pop();
      args.push(function () {
        self._done();
        cb.apply(this, arguments);
      });

      // execute
      fs[name].apply(fs, args);
    });
  };
}
