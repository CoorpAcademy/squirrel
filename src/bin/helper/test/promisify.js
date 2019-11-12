import test from 'ava';
import promisify from '../promisify';

test('should return a fullfilled promise', async t => {
  const callbackFunction = function(cb) {
    cb();
  };

  await t.notThrowsAsync(promisify(callbackFunction)());
});

test('should return a rejected promise', async t => {
  const callbackFunction = function(cb) {
    cb(new Error());
  };

  await t.throwsAsync(promisify(callbackFunction)());

  const throwFunction = function(cb) {
    throw new Error('error');
  };

  await t.throwsAsync(promisify(throwFunction)());
});
