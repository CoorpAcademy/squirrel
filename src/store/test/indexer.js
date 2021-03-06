import test from 'ava';
import createIndexer from '../indexer';

test('should create indexer', t => {
  t.is(typeof createIndexer(['name']), 'function');
  t.notThrows(() => createIndexer(['name']));
});

test('should create index', t => {
  const indexes = ['foo'];

  const input = {
    foo: {
      key: 'foo',
      value: {
        foo: 'foo'
      }
    },
    bar: {
      key: 'bar',
      value: {
        foo: 'bar'
      }
    }
  };

  const output = {
    foo: {
      foo: {
        key: 'foo',
        value: {
          foo: 'foo'
        }
      },
      bar: {
        key: 'bar',
        value: {
          foo: 'bar'
        }
      }
    }
  };

  t.deepEqual(createIndexer(indexes)(input), output);
});

test('should index with two same entry', t => {
  const indexes = ['foo'];

  const input = {
    foo: {
      key: 'foo',
      value: {
        foo: 'foo'
      }
    },
    bar: {
      key: 'bar',
      value: {
        foo: 'foo'
      }
    }
  };

  const output = {
    foo: {
      foo: {
        key: 'bar',
        value: {
          foo: 'foo'
        }
      }
    }
  };

  t.deepEqual(createIndexer(indexes)(input), output);
});

test('should create index with deep key', t => {
  const indexes = ['foo.bar'];

  const input = {
    foo: {
      key: 'foo',
      value: {
        foo: {
          bar: 'baz'
        }
      }
    },
    bar: {
      key: 'bar',
      value: {
        foo: {
          bar: 'qux'
        }
      }
    }
  };

  const output = {
    'foo.bar': {
      baz: {
        key: 'foo',
        value: {
          foo: {
            bar: 'baz'
          }
        }
      },
      qux: {
        key: 'bar',
        value: {
          foo: {
            bar: 'qux'
          }
        }
      }
    }
  };

  t.deepEqual(createIndexer(indexes)(input), output);
});
