import test from 'ava';
import createEtcdMock from '../util/test/helpers/etcd';

import createAPI from '../api';
const node = {
  key: '/',
  dir: true,
  nodes: [{
    key: '/foo',
    value: {
      value: 'foo',
      deep: {
        value: 'foo'
      }
    }
  }, {
    key: '/bar',
    dir: true,
    nodes: [{
      key: '/bar/baz',
      value: {
        value: 'baz',
        deep: {
          value: 'baz'
        }
      }
    }, {
      key: '/bar/qux',
      value: {
        value: 'qux',
        deep: {
          value: 'quz'
        }
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
  },
  'deep.value': {
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
  t.truthy(api.set);
});

test('should get keys of simple index', async t => {
  t.deepEqual(
    await api.getAll('value'),
    ['foo', 'baz', 'qux']
  );
});

test('should get keys of complex index', async t => {
  t.deepEqual(
    await api.getAll('deep.value'),
    ['foo', 'baz', 'qux']
  );
});

test('should get empty array if simple index doesn\'t exists', async t => {
  t.deepEqual(
    await api.getAll('nope'),
    []
  );
});

test('should get node by simple index', async t => {
  t.deepEqual(
    await api.getBy('value', 'foo'),
    {
      value: 'foo'
    }
  );
});

test('should get null if any node matches', async t => {
  t.deepEqual(
    await api.getBy('value', 'nope'),
    null
  );
});

test('should get null if any index matches', async t => {
  t.deepEqual(
    await api.getBy('nope', 'nope'),
    null
  );
});

test('should get node by complex index', async t => {
  t.deepEqual(
    await api.getBy('deep.value', 'foo'),
    {
      value: 'foo'
    }
  );
});

test('should get null if any complex index matches', async t => {
  t.deepEqual(
    await api.getBy('deep.nope', 'nope'),
    null
  );
});

test('should get root node by path', async t => {
  t.deepEqual(
    await api.get('/'),
    node
  );
});

test('should get node by path', async t => {
  t.deepEqual(
    await api.get('/foo'),
    node.nodes[0]
  );
});

test('should get null if any node matches this path', async t => {
  t.deepEqual(
    await api.get('/nope'),
    null
  );
});

test('should set nothing if value is null', async t => {
  const client = createEtcdMock({
    set: [{
      assert: (key, value) => {
        t.deepEqual(key, '/nope');
        t.deepEqual(value, null);
      },
      values: [null, null, null]
    }]
  });
  const api = createAPI(getStore, client);
  t.deepEqual(
    await api.set('/nope', null),
    null
  );
});

test('should set value if value setted', async t => {
  const client = createEtcdMock({
    set: [{
      assert: (key, value) => {
        t.deepEqual(key, '/foo');
        t.deepEqual(value, {foo: 'baz'});
      },
      values: [null, {foo: 'baz'}, null]
    }]
  });
  const api = createAPI(getStore, client);
  t.deepEqual(
    await api.set('/foo', {foo: 'baz'}),
    {foo: 'baz'}
  );
});

test('should failed if error occured', async t => {
  const client = createEtcdMock({
    set: [[new Error('boom'), null, null]]
  });
  const api = createAPI(getStore, client);
  t.throws(
    api.set('/foo', {foo: 'baz'}),
    /boom/
  );
});
