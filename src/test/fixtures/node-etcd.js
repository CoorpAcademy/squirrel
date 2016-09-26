'use strict';

function Etcd(options = {}) {
  this.options = options;
}

Etcd.prototype.set = function set(path, value, callback) {
  if (this.options.err) {
    return callback(this.options.err);
  }
  callback(null, value);
};

module.exports = Etcd;
