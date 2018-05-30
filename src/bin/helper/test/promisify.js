import test from 'ava';
import promisify from '../promisify';

test('should return a fullfilled promise', t => {
  const callbackFunction = function(cb) {
    cb();
  };

  return t.notThrows(promisify(callbackFunction)());
});

test('should return a rejected promise', async t => {
  const callbackFunction = function(cb) {
    cb(new Error());
  };

  await t.throws(promisify(callbackFunction)());

  const throwFunction = function(cb) {
    throw new Error('error');
  };

  return t.throws(promisify(throwFunction)());
});
