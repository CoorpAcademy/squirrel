import test from 'ava';
import {join} from 'path';
import createSquirrel from '../index';

const testOptions = {
  indexes: ['foo'],
  fallback: join(__dirname, 'fixtures/fallback.json'),
  save: false
};

test('should create Squirrel', t => {
  const squirrel = createSquirrel();

  t.truthy(squirrel);
  t.truthy(squirrel.get);
  t.truthy(squirrel.getBy);
  t.truthy(squirrel.getAll);
  t.truthy(squirrel.close);

  squirrel.close();
});

test('should provide getAll function', t => {
  const client = createSquirrel(testOptions);

  return Promise.all([
    client.getAll('foo').then(values =>
      t.deepEqual(values, ['bar'])
    ),
    client.getAll('bar').then(values =>
      t.deepEqual(values, [])
    )
  ]);
});

test('should provide getBy function', t => {
  const client = createSquirrel(testOptions);

  return Promise.all([
    client.getBy('foo', 'foo').then(value =>
      t.deepEqual(value, null)
    ),
    client.getBy('foo', 'bar').then(value =>
      t.deepEqual(value, {
        foo: 'bar'
      })
    ),
    client.getBy('bar', 'bar').then(value =>
      t.deepEqual(value, null)
    )
  ]);
});

test('should provide get function', t => {
  const client = createSquirrel(testOptions);

  return Promise.all([
    client.get('/').then(value =>
      t.deepEqual(value, {
        key: '/',
        dir: true,
        nodes: [{
          key: '/foo',
          value: {
            foo: 'bar'
          }
        }]
      })
    ),
    client.get('/foo').then(value =>
      t.deepEqual(value, {
        key: '/foo',
        value: {
          foo: 'bar'
        }
      })
    ),
    client.get('/bar').then(value =>
      t.deepEqual(value, null)
    )
  ]);
});
