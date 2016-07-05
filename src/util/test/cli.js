import {join} from 'path';
import {xor} from 'lodash/fp';
import test from 'ava';
import {
  syncFile$,
  syncDirectory$,
  sync$
} from '../cli';
import createEtcdMock from './helpers/etcd';

const NotExistsError = new Error();
NotExistsError.errorCode = 100;

const UnknownError = new Error();

test('should create etcd directory if not exists', t => {
  const client = createEtcdMock({
    get: [{
      assert: key =>
        t.deepEqual(key, '/test'),
      values: [NotExistsError, null, null]
    }],
    mkdir: [{
      assert: key =>
        t.deepEqual(key, '/test'),
      values: [null, {
        action: 'set',
        node: {
          key: '/test',
          dir: true,
          nodes: []
        }
      }, null]
    }]
  });

  return syncDirectory$(client, join(__dirname, 'fixtures/fs'), '/test').toArray().toPromise().then(events => {
    t.deepEqual(xor(events, ['foo', 'bar']), []);
    t.plan(3);
  });
});

test('should throw error on directory sync if etcd throw unknown error', t => {
  const client = createEtcdMock({
    get: [{
      assert: key =>
        t.deepEqual(key, '/test'),
      values: [UnknownError, null, null]
    }],
    mkdir: [{
      assert: key =>
        t.fail(),
      values: [null, null, null]
    }]
  });

  return syncDirectory$(client, join(__dirname, 'fixtures/fs'), '/test').toArray().toPromise().then(() =>
    t.fail()
  , () =>
    Promise.resolve()
  );
});

test('should remove extra entry of directory', t => {
  const client = createEtcdMock({
    get: [{
      assert: key =>
        t.deepEqual(key, '/test'),
      values: [null, {
        action: 'get',
        node: {
          key: '/test',
          dir: true,
          nodes: [{
            key: '/test/baz',
            value: 'baz'
          }]
        }
      }, null]
    }],
    del: [{
      assert: key =>
        t.deepEqual(key, '/test/baz'),
      values: [null, '/test/baz', null]
    }]
  });

  syncDirectory$(client, join(__dirname, 'fixtures/fs'), '/test').toArray().toPromise().then(events => {
    t.deepEqual(xor(events, ['bar', 'foo']), []);
    t.plan(3);
  });
});

test('should create file if doesn\t exists', t => {
  const client = createEtcdMock({
    get: [{
      assert: key =>
        t.deepEqual(key, '/test/foo'),
      values: [NotExistsError, null, null]
    }],
    set: [{
      assert: (key, value) => {
        t.deepEqual(key, '/test/foo');
        t.deepEqual(value, 'foo');
      },
      values: [null, {
        action: 'set',
        node: {
          key: '/test/foo',
          value: 'foo'
        }
      }, null]
    }]
  });

  return syncFile$(client, join(__dirname, 'fixtures/fs/foo'), '/test/foo').toArray().toPromise().then(events => {
    t.deepEqual(events, []);
    t.plan(4);
  });
});

test('should throw error on file sync if etcd throw unknown error', t => {
  const client = createEtcdMock({
    get: [{
      assert: key =>
        t.deepEqual(key, '/test/foo'),
      values: [UnknownError, null, null]
    }],
    set: [{
      assert: (key, value) =>
        t.fail()
    }]
  });

  return syncFile$(client, join(__dirname, 'fixtures/fs/foo'), '/test/foo').toArray().toPromise().then(() =>
    t.fail()
  , () =>
    Promise.resolve()
  );
});

test('should remove directory if it should be a file', t => {
  const client = createEtcdMock({
    get: [{
      assert: key =>
        t.deepEqual(key, '/test/foo'),
      values: [null, {
        action: 'get',
        node: {
          key: '/test/foo',
          dir: true,
          nodes: []
        }
      }, null]
    }],
    rmdir: [{
      assert: (key, options) => {
        t.deepEqual(key, '/test/foo');
        t.deepEqual(options, {recursive: true});
      },
      values: [null, {
        action: 'delete',
        node: {
          key: '/test/foo'
        },
        prevNode: {
          key: '/test/foo',
          dir: true,
          nodes: []
        }
      }, null]
    }],
    set: [{
      assert: (key, value) => {
        t.deepEqual(key, '/test/foo');
        t.deepEqual(value, 'foo');
      },
      values: [null, {
        action: 'set',
        node: {
          key: '/test/foo',
          value: 'foo'
        }
      }, null]
    }]
  });

  return syncFile$(client, join(__dirname, 'fixtures/fs/foo'), '/test/foo').toArray().toPromise().then(events => {
    t.deepEqual(events, []);
    t.plan(6);
  });
});

test('should remove file if it should be a directory', t => {
  const client = createEtcdMock({
    get: [{
      assert: key =>
        t.deepEqual(key, '/test/bar'),
      values: [null, {
        action: 'get',
        node: {
          key: '/test/bar',
          value: 'foo'
        }
      }, null]
    }],
    del: [{
      assert: key =>
        t.deepEqual(key, '/test/bar'),
      values: [null, {
        action: 'delete',
        node: {
          key: '/test/bar'
        },
        prevNode: {
          key: '/test/bar',
          value: 'foo'
        }
      }, null]
    }],
    mkdir: [{
      assert: key =>
        t.deepEqual(key, '/test/bar'),
      values: [null, {
        action: 'set',
        node: {
          key: '/test/bar',
          dir: true,
          nodes: []
        }
      }, null]
    }]
  });

  return syncDirectory$(client, join(__dirname, 'fixtures/fs/bar'), '/test/bar').toArray().toPromise().then(events => {
    t.deepEqual(events, ['baz']);
    t.plan(4);
  });
});

test('should update file if it\'s outdated', t => {
  const client = createEtcdMock({
    get: [{
      assert: key =>
        t.deepEqual(key, '/test/foo'),
      values: [null, {
        action: 'get',
        node: {
          key: '/test/foo',
          value: 'bar'
        }
      }, null]
    }],
    set: [{
      assert: (key, value) => {
        t.deepEqual(key, '/test/foo');
        t.deepEqual(value, 'foo');
      },
      values: [null, {
        action: 'set',
        node: {
          key: '/test/foo',
          value: 'foo'
        },
        prevNode: {
          key: '/test/foo',
          value: 'bar'
        }
      }, null]
    }]
  });

  return syncFile$(client, join(__dirname, 'fixtures/fs/foo'), '/test/foo').toArray().toPromise().then(events => {
    t.deepEqual(events, []);
    t.plan(4);
  });
});

test('shouldn\'t update file if it\'s updated', t => {
  const client = createEtcdMock({
    get: [{
      assert: key =>
        t.deepEqual(key, '/test/foo'),
      values: [null, {
        action: 'get',
        node: {
          key: '/test/foo',
          value: 'foo'
        }
      }, null]
    }],
    set: [{
      assert: (key, value) =>
        t.fail()
    }]
  });

  return syncFile$(client, join(__dirname, 'fixtures/fs/foo'), '/test/foo').toArray().toPromise().then(events => {
    t.deepEqual(events, []);
    t.plan(2);
  });
});

test('should loop on sync', t => {
  const client = createEtcdMock({
    get: [{
      assert: key =>
        t.pass(),
      values: [null, {
        action: 'get',
        node: {
          key: '/test',
          dir: true
        }
      }, null]
    }, {
      assert: key =>
        t.pass(),
      values: [NotExistsError, null, null]
    }, {
      assert: key =>
        t.pass(),
      values: [NotExistsError, null, null]
    }, {
      assert: key =>
        t.pass(),
      values: [NotExistsError, null, null]
    }],
    set: [{
      assert: (key, value) =>
        t.pass(),
      values: [null, {
        action: 'set',
        node: {
          key: '/test/foo',
          value: 'foo'
        }
      }, null]
    }, {
      assert: (key, value) =>
        t.pass(),
      values: [null, {
        action: 'set',
        node: {
          key: '/test/bar/baz',
          value: ' '
        }
      }, null]
    }],
    mkdir: [{
      assert: (key, value) =>
        t.pass(),
      values: [null, {
        action: 'set',
        node: {
          key: '/test/bar',
          dir: true,
          nodes: []
        }
      }, null]
    }]
  });

  return sync$(client, join(__dirname, 'fixtures/fs'), '/test').toPromise().then(() => {
    t.plan(7);
  });
});
