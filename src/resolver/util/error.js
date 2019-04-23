'use strict';

const util = require('util');

function BrandNotFound(message, brand) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.brand = brand;
  this.status = 404;
}

util.inherits(BrandNotFound, Error);

module.exports = {
  BrandNotFound
};
