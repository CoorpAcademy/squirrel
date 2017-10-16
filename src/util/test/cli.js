import {join} from 'path';
import {xor} from 'lodash/fp';
import test from 'ava';
import {syncFile$, syncDirectory$, sync$} from '../cli';
import createEtcdMock from './helpers/etcd';

const NotExistsError = new Error('NotExistsError');
NotExistsError.errorCode = 100;

const UnknownError = new Error('UnknownError');

test('should create etcd directory if not exists', t => {
  t.plan(3);
  const client = createEtcdMock({
    get: [
      {
        assert: key => t.deepEqual(key, '/test'),
        values: [NotExistsError, null, null]
      }
    ],
    mkdir: [
      {
        assert: key => t.deepEqual(key, '/test'),
        values: [
          null,
          {
            action: 'set',
            node: {
              key: '/test',
              dir: true,
              nodes: []
            }
          },
          null
        ]
      }
    ]
  });

  return syncDirectory$(client, join(__dirname, 'fixtures/fs'), '/test')
    .toArray()
    .do(events => {
      t.deepEqual(xor(events, ['foo', 'bar']), []);
    })
    .toPromise();
});

test('should throw error on directory sync if etcd throws unknown error', t => {
  const client = createEtcdMock({
    get: [
      {
        assert: key => t.deepEqual(key, '/test'),
        values: [UnknownError, null, null]
      }
    ],
    mkdir: [
      {
        assert: key => t.fail(),
        values: [null, null, null]
      }
    ]
  });

  return t.throws(
    syncDirectory$(client, join(__dirname, 'fixtures/fs'), '/test')
      .toArray()
      .toPromise(),
    'UnknownError'
  );
});

test('should remove extra entry of directory', t => {
  t.plan(3);
  const client = createEtcdMock({
    get: [
      {
        assert: key => t.deepEqual(key, '/test'),
        values: [
          null,
          {
            action: 'get',
            node: {
              key: '/test',
              dir: true,
              nodes: [
                {
                  key: '/test/baz',
                  value: 'baz'
                }
              ]
            }
          },
          null
        ]
      }
    ],
    del: [
      {
        assert: key => t.deepEqual(key, '/test/baz'),
        values: [null, '/test/baz', null]
      }
    ]
  });

  return syncDirectory$(client, join(__dirname, 'fixtures/fs'), '/test')
    .toArray()
    .do(events => {
      t.deepEqual(xor(events, ['bar', 'foo']), []);
    })
    .toPromise();
});

test('should create file if doesn\t exists', async t => {
  t.plan(4);
  const client = createEtcdMock({
    get: [
      {
        assert: key => t.deepEqual(key, '/test/foo'),
        values: [NotExistsError, null, null]
      }
    ],
    set: [
      {
        assert: (key, value) => {
          t.deepEqual(key, '/test/foo');
          t.deepEqual(value, 'foo');
        },
        values: [
          null,
          {
            action: 'set',
            node: {
              key: '/test/foo',
              value: 'foo'
            }
          },
          null
        ]
      }
    ]
  });

  const events = await syncFile$(client, join(__dirname, 'fixtures/fs/foo'), '/test/foo')
    .toArray()
    .toPromise();
  t.deepEqual(events, []);
});

test('should throw error on file sync if etcd throws unknown error', t => {
  const client = createEtcdMock({
    get: [
      {
        assert: key => t.deepEqual(key, '/test/foo'),
        values: [UnknownError, null, null]
      }
    ],
    set: [
      {
        assert: (key, value) => t.fail()
      }
    ]
  });

  return t.throws(
    syncFile$(client, join(__dirname, 'fixtures/fs/foo'), '/test/foo')
      .toArray()
      .toPromise(),
    'UnknownError'
  );
});

test('should remove directory if it should be a file', async t => {
  t.plan(6);
  const client = createEtcdMock({
    get: [
      {
        assert: key => t.deepEqual(key, '/test/foo'),
        values: [
          null,
          {
            action: 'get',
            node: {
              key: '/test/foo',
              dir: true,
              nodes: []
            }
          },
          null
        ]
      }
    ],
    rmdir: [
      {
        assert: (key, options) => {
          t.deepEqual(key, '/test/foo');
          t.deepEqual(options, {recursive: true});
        },
        values: [
          null,
          {
            action: 'delete',
            node: {
              key: '/test/foo'
            },
            prevNode: {
              key: '/test/foo',
              dir: true,
              nodes: []
            }
          },
          null
        ]
      }
    ],
    set: [
      {
        assert: (key, value) => {
          t.deepEqual(key, '/test/foo');
          t.deepEqual(value, 'foo');
        },
        values: [
          null,
          {
            action: 'set',
            node: {
              key: '/test/foo',
              value: 'foo'
            }
          },
          null
        ]
      }
    ]
  });

  const events = await syncFile$(client, join(__dirname, 'fixtures/fs/foo'), '/test/foo')
    .toArray()
    .toPromise();
  t.deepEqual(events, []);
});

test('should remove file if it should be a directory', async t => {
  t.plan(4);
  const client = createEtcdMock({
    get: [
      {
        assert: key => t.deepEqual(key, '/test/bar'),
        values: [
          null,
          {
            action: 'get',
            node: {
              key: '/test/bar',
              value: 'foo'
            }
          },
          null
        ]
      }
    ],
    del: [
      {
        assert: key => t.deepEqual(key, '/test/bar'),
        values: [
          null,
          {
            action: 'delete',
            node: {
              key: '/test/bar'
            },
            prevNode: {
              key: '/test/bar',
              value: 'foo'
            }
          },
          null
        ]
      }
    ],
    mkdir: [
      {
        assert: key => t.deepEqual(key, '/test/bar'),
        values: [
          null,
          {
            action: 'set',
            node: {
              key: '/test/bar',
              dir: true,
              nodes: []
            }
          },
          null
        ]
      }
    ]
  });

  const events = await syncDirectory$(client, join(__dirname, 'fixtures/fs/bar'), '/test/bar')
    .toArray()
    .toPromise();
  t.deepEqual(events, ['baz']);
});

test("should update file if it's outdated", async t => {
  t.plan(4);
  const client = createEtcdMock({
    get: [
      {
        assert: key => t.deepEqual(key, '/test/foo'),
        values: [
          null,
          {
            action: 'get',
            node: {
              key: '/test/foo',
              value: 'bar'
            }
          },
          null
        ]
      }
    ],
    set: [
      {
        assert: (key, value) => {
          t.deepEqual(key, '/test/foo');
          t.deepEqual(value, 'foo');
        },
        values: [
          null,
          {
            action: 'set',
            node: {
              key: '/test/foo',
              value: 'foo'
            },
            prevNode: {
              key: '/test/foo',
              value: 'bar'
            }
          },
          null
        ]
      }
    ]
  });

  const events = await syncFile$(client, join(__dirname, 'fixtures/fs/foo'), '/test/foo')
    .toArray()
    .toPromise();
  t.deepEqual(events, []);
});

test("shouldn't update file if it's updated", async t => {
  t.plan(2);
  const client = createEtcdMock({
    get: [
      {
        assert: key => t.deepEqual(key, '/test/foo'),
        values: [
          null,
          {
            action: 'get',
            node: {
              key: '/test/foo',
              value: 'foo'
            }
          },
          null
        ]
      }
    ],
    set: [
      {
        assert: (key, value) => t.fail()
      }
    ]
  });

  const events = await syncFile$(client, join(__dirname, 'fixtures/fs/foo'), '/test/foo')
    .toArray()
    .toPromise();
  t.deepEqual(events, []);
});

test('should loop on sync', async t => {
  t.plan(7);
  const client = createEtcdMock({
    get: [
      {
        assert: key => t.pass(),
        values: [
          null,
          {
            action: 'get',
            node: {
              key: '/test',
              dir: true
            }
          },
          null
        ]
      },
      {
        assert: key => t.pass(),
        values: [NotExistsError, null, null]
      },
      {
        assert: key => t.pass(),
        values: [NotExistsError, null, null]
      },
      {
        assert: key => t.pass(),
        values: [NotExistsError, null, null]
      }
    ],
    set: [
      {
        assert: (key, value) => t.pass(),
        values: [
          null,
          {
            action: 'set',
            node: {
              key: '/test/foo',
              value: 'foo'
            }
          },
          null
        ]
      },
      {
        assert: (key, value) => t.pass(),
        values: [
          null,
          {
            action: 'set',
            node: {
              key: '/test/bar/baz',
              value: ' '
            }
          },
          null
        ]
      }
    ],
    mkdir: [
      {
        assert: (key, value) => t.pass(),
        values: [
          null,
          {
            action: 'set',
            node: {
              key: '/test/bar',
              dir: true,
              nodes: []
            }
          },
          null
        ]
      }
    ]
  });

  await sync$(client, join(__dirname, 'fixtures/fs'), '/test').toPromise();
});
