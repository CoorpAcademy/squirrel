import test from 'ava';
import createIndexBuild from '../build-index';

test('should create indexer', t => {
  createIndexBuild(['name']);
});

test('should create index', t => {
  const indexes = ['foo'];

  const input = {
    key: '/',
    dir: true,
    nodes: [
      {
        key: '/foo',
        value: {
          foo: 'foo'
        }
      },
      {
        key: '/bar',
        value: {
          foo: 'bar'
        }
      }
    ]
  };

  const output = {
    foo: {
      foo: {
        key: '/foo',
        value: {
          foo: 'foo'
        }
      },
      bar: {
        key: '/bar',
        value: {
          foo: 'bar'
        }
      }
    }
  };

  t.deepEqual(createIndexBuild(indexes)(input), output);
});

test('should index with two same entry', t => {
  const indexes = ['foo'];

  const input = {
    key: '/',
    dir: true,
    nodes: [
      {
        key: '/foo',
        value: {
          foo: 'foo'
        }
      },
      {
        key: '/bar',
        value: {
          foo: 'foo'
        }
      }
    ]
  };

  const output = {
    foo: {
      foo: {
        key: '/bar',
        value: {
          foo: 'foo'
        }
      }
    }
  };

  t.deepEqual(createIndexBuild(indexes)(input), output);
});

test('should create index with deep key', t => {
  const indexes = ['foo.bar'];

  const input = {
    key: '/',
    dir: true,
    nodes: [
      {
        key: '/foo',
        value: {
          foo: {
            bar: 'baz'
          }
        }
      },
      {
        key: '/bar',
        value: {
          foo: {
            bar: 'qux'
          }
        }
      }
    ]
  };

  const output = {
    'foo.bar': {
      baz: {
        key: '/foo',
        value: {
          foo: {
            bar: 'baz'
          }
        }
      },
      qux: {
        key: '/bar',
        value: {
          foo: {
            bar: 'qux'
          }
        }
      }
    }
  };

  t.deepEqual(createIndexBuild(indexes)(input), output);
});
