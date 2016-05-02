import test from 'ava';

import createAPI from '../api';

const node = {
  key: '/',
  dir: true,
  nodes: [{
    key: '/foo',
    value: {
      value: 'foo'
    }
  }, {
    key: '/bar',
    dir: true,
    nodes: [{
      key: '/bar/baz',
      value: {
        value: 'baz'
      }
    }, {
      key: '/bar/qux',
      value: {
        value: 'qux'
      }
    }]
  }]
};

const indexes = {
  value: {
    foo: {
      key: '/foo',
      value: {
        value: 'foo'
      }
    },
    baz: {
      key: '/bar/baz',
      value: {
        value: 'baz'
      }
    },
    qux: {
      key: '/bar/qux',
      value: {
        value: 'qux'
      }
    }
  }
};

const store = {
  node,
  indexes
};

const getStore = key => Promise.resolve(store[key]);
const api = createAPI(getStore);

test('should create API', t => {
  t.truthy(api);
  t.truthy(api.get);
  t.truthy(api.getBy);
  t.truthy(api.getAll);
});

test('should provide getAll function', t => {
  return Promise.all([
    api.getAll('value').then(values =>
      t.deepEqual(values, ['foo', 'baz', 'qux'])
    ),
    api.getAll('nope').then(values =>
      t.deepEqual(values, [])
    )
  ]);
});

test('should provide getBy function', t => {
  return Promise.all([
    api.getBy('value', 'nope').then(value =>
      t.deepEqual(value, null)
    ),
    api.getBy('value', 'foo').then(value =>
      t.deepEqual(value, {
        value: 'foo'
      })
    ),
    api.getBy('nope', 'nope').then(value =>
      t.deepEqual(value, null)
    )
  ]);
});

test('should provide get function', t => {
  return Promise.all([
    api.get('/').then(value =>
      t.deepEqual(value, node)
    ),
    api.get('/foo').then(value =>
      t.deepEqual(value, node.nodes[0])
    ),
    api.get('/nope').then(value =>
      t.deepEqual(value, null)
    )
  ]);
});
