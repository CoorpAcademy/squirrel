import test from 'ava';
import createAPI from '../api';

const records = {
  foo: {
    key: 'foo',
    value: {
      value: 'foo',
      deep: {
        value: 'foo'
      }
    },
    version: '1'
  },
  'bar/baz': {
    key: 'bar/baz',
    value: {
      value: 'baz',
      deep: {
        value: 'baz'
      }
    },
    version: '1'
  },
  'bar/qux': {
    key: 'bar/qux',
    value: {
      value: 'qux',
      deep: {
        value: 'quz'
      }
    },
    version: '1'
  },
  bim: {
    key: 'bim',
    value: {
      value: 'mfw',
      deep: {
        value: 'fwiw'
      }
    },
    version: '1'
  },
  'bim/bam': {
    key: 'bim/bam',
    value: {
      value: 'yolo',
      deep: {
        value: 'lol'
      }
    },
    version: '1'
  }
};

const indexes = {
  value: {
    foo: {
      key: 'foo',
      value: {
        value: 'foo',
        deep: {
          value: 'foo'
        }
      },
      version: '1'
    },
    baz: {
      key: 'bar/baz',
      value: {
        value: 'baz'
      },
      version: '1'
    },
    qux: {
      key: 'bar/qux',
      value: {
        value: 'qux'
      },
      version: '1'
    }
  },
  'deep.value': {
    foo: {
      key: 'foo',
      value: {
        value: 'foo'
      },
      version: '1'
    },
    baz: {
      key: 'bar/baz',
      value: {
        value: 'baz'
      },
      version: '1'
    },
    qux: {
      key: 'bar/qux',
      value: {
        value: 'qux'
      },
      version: '1'
    },

    bim: {
      key: 'bim',
      value: {
        value: 'mfw'
      },
      version: '1'
    },
    bam: {
      key: 'bim/bam',
      value: {
        value: 'yolo'
      },
      version: '1'
    }
  }
};

const store = {
  records,
  indexes
};

const getStore = key => Promise.resolve(store[key]);

test('getAll should all keys of index', async t => {
  const api = createAPI(getStore, {});
  const actual = await api.getAll('value');
  const expected = ['foo', 'baz', 'qux'];
  t.deepEqual(actual, expected);
});

test("getAll should return an empty array if index doesn't exists", async t => {
  const api = createAPI(getStore, {});
  const actual = await api.getAll('nope');
  const expected = [];
  t.deepEqual(actual, expected);
});

test('getBy should search record by index (simple index)', async t => {
  const api = createAPI(getStore, {});
  const actual = await api.getBy('value', 'baz');
  const expected = {
    value: 'baz'
  };
  t.deepEqual(actual, expected);
});

test('getBy should search record by index (complex index)', async t => {
  const api = createAPI(getStore, {});
  const actual = await api.getBy('deep.value', 'bim');
  const expected = {
    value: 'mfw'
  };
  t.deepEqual(actual, expected);
});

test('getBy should return null if any match was found', async t => {
  const api = createAPI(getStore, {});
  const actual = await api.getBy('value', 'nope');
  const expected = null;
  t.deepEqual(actual, expected);
});

test('getByRaw should search record by index (simple index)', async t => {
  const api = createAPI(getStore, {});
  const actual = await api.getByRaw('value', 'baz');
  const expected = {
    key: 'bar/baz',
    value: {
      value: 'baz'
    },
    version: '1'
  };
  t.deepEqual(actual, expected);
});

test('getByRaw should search record by index (complex index)', async t => {
  const api = createAPI(getStore, {});
  const actual = await api.getByRaw('deep.value', 'bim');
  const expected = {
    key: 'bim',
    value: {
      value: 'mfw'
    },
    version: '1'
  };
  t.deepEqual(actual, expected);
});

test('getByRaw should return null if any match was found', async t => {
  const api = createAPI(getStore, {});
  const actual = await api.getByRaw('value', 'nope');
  const expected = null;
  t.deepEqual(actual, expected);
});

test('get should return record by key', async t => {
  const api = createAPI(getStore, {});
  const actual = await api.get('bar/baz');
  const expected = {
    key: 'bar/baz',
    value: {
      value: 'baz',
      deep: {
        value: 'baz'
      }
    },
    version: '1'
  };
  t.deepEqual(actual, expected);
});

test('get should return null if any match was found', async t => {
  const api = createAPI(getStore, {});
  const actual = await api.get('value', 'nope');
  const expected = null;
  t.deepEqual(actual, expected);
});

test('set should write to etcd', async t => {
  const client = {
    put: key => ({
      value: value => {
        t.deepEqual(key, 'foo');
        t.deepEqual(value, JSON.stringify({foo: 'foo'}));
        return Promise.resolve();
      }
    })
  };
  const api = createAPI(getStore, client);
  await t.notThrows(api.set('foo', {foo: 'foo'}));
});

test('set should throw', async t => {
  const client = {
    put: () => ({
      value: () => Promise.reject(new Error('boom'))
    })
  };
  const api = createAPI(getStore, client);
  await t.throws(api.set('foo', {foo: 'foo'}), 'boom');
});

test('del should write to etcd', async t => {
  const client = {
    delete: () => ({
      key: key => {
        t.deepEqual(key, 'foo');
        return Promise.resolve();
      }
    })
  };
  const api = createAPI(getStore, client);
  await t.notThrows(api.del('foo'));
});

test('del should throw', async t => {
  const client = {
    delete: () => ({
      key: () => Promise.reject(new Error('boom'))
    })
  };
  const api = createAPI(getStore, client);
  await t.throws(api.del('foo'), 'boom');
});
