import test from 'ava';
import {slice} from 'lodash/fp';
import {
  compareAndSwap$,
  del$,
  delRecursive$,
  get$,
  getRecursive$,
  mkdir$,
  rmdir$,
  rmdirRecursive$,
  set$,
  isDirectory,
  isFile
} from '../etcd';

const action = (_action, _node, _prevNode) => ({action: _action, node: _node, prevNode: _prevNode});
const node = (key, value, dir) => ({key, value, dir});
const headers = () => ({'content-type': 'application/json'});

[{
  title: 'should compareAndSwap',
  fn$: compareAndSwap$,
  fn: 'compareAndSwap',
  argz: ['foo', 'foo', 'bar'],
  results: [action('set', node('/foo', 'foo'), node('/foo', 'bar')), headers]
}, {
  title: 'should del',
  fn$: del$,
  fn: 'del',
  argz: ['foo'],
  results: [action('delete', node('/foo'), node('/foo', 'foo')), headers]
}, {
  title: 'should delRecursive',
  fn$: delRecursive$,
  fn: 'del',
  argz: ['foo', {recursive: true}],
  results: [action('delete', node('/foo'), node('/foo', 'foo')), headers]
}, {
  title: 'should get',
  fn$: get$,
  fn: 'get',
  argz: ['foo'],
  results: [action('get', node('/foo', 'foo')), headers]
}, {
  title: 'should getRecursive',
  fn$: getRecursive$,
  fn: 'get',
  argz: ['foo'],
  expected: ['foo', {recursive: true}],
  results: [action('get', node('/foo', 'foo')), headers]
}, {
  title: 'should mkdir',
  fn$: mkdir$,
  fn: 'mkdir',
  argz: ['foo'],
  results: [action('get', node('/foo', null, true)), headers]
}, {
  title: 'should rmdir',
  fn$: rmdir$,
  fn: 'rmdir',
  argz: ['foo'],
  results: [action('delete', node('/foo'), node('/foo', null, true)), headers]
}, {
  title: 'should rmdirRecursive',
  fn$: rmdirRecursive$,
  fn: 'rmdir',
  argz: ['foo'],
  expected: ['foo', {recursive: true}],
  results: [action('delete', node('/foo'), node('/foo', null, true)), headers]
}, {
  title: 'should set',
  fn$: set$,
  fn: 'set',
  argz: ['foo', 'foo'],
  results: [action('set', node('/foo', 'foo'), node('/foo', 'bar')), headers]
}].forEach(({title, fn$, fn, argz, expected, results}) => {
  test(title, async t => {
    t.plan(3);
    const events = await fn$({
      [fn]: (..._argz) => {
        const cb = _argz.pop();
        t.deepEqual(expected || argz, _argz);
        cb(null, ...results);
        return {
          abort: () => {
            t.pass();
          }
        };
      }
    }, ...argz).toArray().toPromise();
    t.deepEqual(events, slice(0, results.length - 1, results));
  });

  test(`${title} be cancellable`, t => {
    t.plan(1);
    fn$({
      [fn]: (..._argz) => {
        return {
          abort: () => {
            t.pass();
          }
        };
      }
    }, ...argz).subscribe().unsubscribe();
  });

  test(`${title} raise error`, async t => {
    t.plan(2);
    try {
      await fn$({
        [fn]: (..._argz) => {
          const cb = _argz.pop();
          cb(new Error('za'));
          return {
            abort: () => {
              t.pass();
            }
          };
        }
      }, ...argz).toPromise();
      t.fail();
    }
    catch (err) {
      t.pass();
    }
  });
});

test('isDirectory should return false on null', t =>
  t.deepEqual(isDirectory(), false)
);

test('isDirectory should return false on file', t =>
  t.deepEqual(isDirectory({}), false)
);

test('isDirectory should return true on directory', t =>
  t.deepEqual(isDirectory({dir: true}), true)
);

test('isFile should return false on null', t =>
  t.deepEqual(isFile(), false)
);

test('isFile should return false on directory', t =>
  t.deepEqual(isFile({dir: true}), false)
);

test('isFile should return true on file', t =>
  t.deepEqual(isFile({}), true)
);
