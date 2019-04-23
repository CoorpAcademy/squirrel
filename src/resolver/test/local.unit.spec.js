'use strict';

const expect = require('chai').expect;
const squirrel = require('../../lib/squirrel/local');

const ENVBACKUP = process.env.NODE_ENV;

describe('squirrel local', function() {
  it('should failed on not implemented search index', function() {
    return squirrel.getBy('notexist').then(
      () => {
        throw new Error('should not happen');
      },
      err => {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.equal('not yet implemented in mock');
      }
    );
  });

  after(function() {
    process.env.NODE_ENV = ENVBACKUP;
  });

  it('should createBrand on development', function() {
    process.env.NODE_ENV = 'development';
    const brand = squirrel.createBrand('digital');
    expect(brand.host).to.equal('localhost:3000');
  });

  it('should delBrand on development', function() {
    process.env.NODE_ENV = 'development';
    const brand = squirrel.createBrand('pleaseKillMe');
    expect(brand.host).to.equal('localhost:3000');

    return squirrel
      .delBrand('pleaseKillMe')
      .then(() => squirrel.getBy('alias', 'pleaseKillMe'))
      .then(r => expect(r).to.equal(undefined));
  });
});
