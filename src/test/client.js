import test from 'ava';
import {Observable} from 'rxjs';
import createIndexer from '../indexer';
import createClient from '../client';

const indexer = createIndexer(['name']);
const store = {
  key: '/',
  dir: true,
  nodes: [{
    key: '/foo',
    value: {
      name: 'foo'
    }
  }]
};
const store$ = Observable.of(store);

test('should create squirrel', t => {
  const client = createClient(store$, indexer);

  return client.getAll('name').then(names =>
    t.deepEqual(names, ['foo'])
  );
});

test('should provide getAll function', t => {
  const client = createClient(store$, indexer);

  return client.getAll('name').then(names =>
    t.deepEqual(names, ['foo'])
  );
});

test('should provide getBy function', t => {
  const client = createClient(store$, indexer);

  return client.getBy('name', 'foo').then(node =>
    t.deepEqual(node, {name: 'foo'})
  );
});

test('should return null if index doesn\'t exists', t => {
  const client = createClient(store$, createIndexer());

  client.getBy('name', 'foo').then(node =>
    t.deepEqual(node, null)
  );
});

test('should provide get function', t => {
  const client = createClient(store$, indexer);

  return client.get('/foo').then(node =>
    t.deepEqual(node, {
      key: '/foo',
      value: {
        name: 'foo'
      }
    })
  );
});

test('should get unknown file', t => {
  const store$ = Observable.create(subscriber => {});
  const client = createClient(store$, indexer);

  return client.get('/foo').then(node =>
    t.deepEqual(node, null)
  );
});
