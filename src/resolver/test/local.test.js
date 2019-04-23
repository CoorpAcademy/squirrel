import test from 'ava';
import * as squirrel from '../local';

const ENVBACKUP = process.env.NODE_ENV;

/* eslint-disable ava/prefer-async-await */
test('should failed on not implemented search index', t => {
  return squirrel.getBy('notexist').then(
    () => {
      throw new Error('should not happen');
    },
    err => {
      t.is(err.message, 'not yet implemented in mock');
    }
  );
});

test.after(function() {
  process.env.NODE_ENV = ENVBACKUP;
});

test('should createBrand on development', t => {
  process.env.NODE_ENV = 'development';
  const brand = squirrel.createBrand('digital');
  t.is(brand.host, 'localhost:3000');
});

test('should delBrand on development', t => {
  process.env.NODE_ENV = 'development';
  const brand = squirrel.createBrand('pleaseKillMe');
  t.is(brand.host, 'localhost:3000');

  return squirrel
    .delBrand('pleaseKillMe')
    .then(() => squirrel.getBy('alias', 'pleaseKillMe'))
    .then(r => t.is(r, undefined));
});
