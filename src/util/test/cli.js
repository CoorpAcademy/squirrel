import {join} from 'path';
import {xor} from 'lodash/fp';
import test from 'ava';
import {
  syncFile$,
  syncDirectory$,
  sync$
} from '../cli';

test('should create etcd directory if not exists', t => {
  return syncDirectory$({
    get: (key, cb) => {
      t.deepEqual(key, '/test');
      const err = new Error();
      err.errorCode = 100;
      cb(err, null, null);
    },
    mkdir: (key, cb) => {
      t.deepEqual(key, '/test');
      cb(null, {
        action: 'set',
        node: {
          key,
          dir: true,
          nodes: []
        }
      }, null);
    }
  }, join(__dirname, 'fixtures/fs'), '/test').toArray().toPromise().then(events => {
    t.deepEqual(xor(events, ['foo', 'bar']), []);
    t.plan(3);
  });
});

test('should throw error on directory sync if etcd throw unknown error', t => {
  return syncDirectory$({
    get: (key, cb) => {
      t.deepEqual(key, '/test');
      const err = new Error();
      cb(err, null, null);
    },
    mkdir: (key, cb) => {
      t.fail();
    }
  }, join(__dirname, 'fixtures/fs'), '/test').toArray().toPromise().then(() =>
    t.fail()
  , () =>
    Promise.resolve()
  );
});

test('should remove extra entry of directory', t => {
  return syncDirectory$({
    get: (key, cb) => {
      t.deepEqual(key, '/test');
      cb(null, {
        action: 'get',
        node: {
          key,
          dir: true,
          nodes: [{
            key: '/test/baz',
            value: 'baz'
          }]
        }
      }, null);
    },
    del: (key, options, cb) => {
      t.deepEqual(key, '/test/baz');
      cb(null, {
        key
      }, null);
    }
  }, join(__dirname, 'fixtures/fs'), '/test').toArray().toPromise().then(events => {
    t.deepEqual(xor(events, ['bar', 'foo']), []);
    t.plan(3);
  });
});

test('should create file if doesn\t exists', t => {
  return syncFile$({
    get: (key, cb) => {
      t.deepEqual(key, '/test/foo');
      const err = new Error();
      err.errorCode = 100;
      cb(err, null, null);
    },
    set: (key, value, cb) => {
      t.deepEqual(key, '/test/foo');
      t.deepEqual(value, 'foo');
      cb(null, {
        action: 'set',
        node: {
          key,
          value
        }
      }, null);
    }
  }, join(__dirname, 'fixtures/fs/foo'), '/test/foo').toArray().toPromise().then(events => {
    t.deepEqual(events, []);
    t.plan(4);
  });
});

test('should throw error on file sync if etcd throw unknown error', t => {
  return syncFile$({
    get: (key, cb) => {
      t.deepEqual(key, '/test/foo');
      const err = new Error();
      cb(err, null, null);
    },
    set: (key, cb) => {
      t.fail();
    }
  }, join(__dirname, 'fixtures/fs/foo'), '/test/foo').toArray().toPromise().then(() =>
    t.fail()
  , () =>
    Promise.resolve()
  );
});

test('should remove directory if it should be a file', t => {
  return syncFile$({
    get: (key, cb) => {
      t.deepEqual(key, '/test/foo');
      cb(null, {
        action: 'get',
        node: {
          key,
          dir: true,
          nodes: []
        }
      }, null);
    },
    rmdir: (key, options, cb) => {
      t.deepEqual(key, '/test/foo');
      t.deepEqual(options, {recursive: true});
      cb(null, {
        action: 'delete',
        node: {
          key
        },
        prevNode: {
          key,
          dir: true,
          nodes: []
        }
      }, null);
    },
    set: (key, value, cb) => {
      t.deepEqual(key, '/test/foo');
      t.deepEqual(value, 'foo');
      cb(null, {
        action: 'set',
        node: {
          key,
          value
        }
      }, null);
    }
  }, join(__dirname, 'fixtures/fs/foo'), '/test/foo').toArray().toPromise().then(events => {
    t.deepEqual(events, []);
    t.plan(6);
  });
});

test('should remove file if it should be a directory', t => {
  return syncDirectory$({
    get: (key, cb) => {
      t.deepEqual(key, '/test/bar');
      cb(null, {
        action: 'get',
        node: {
          key,
          value: 'foo'
        }
      }, null);
    },
    del: (key, cb) => {
      t.deepEqual(key, '/test/bar');
      cb(null, {
        action: 'delete',
        node: {
          key
        },
        prevNode: {
          key,
          value: 'foo'
        }
      }, null);
    },
    mkdir: (key, cb) => {
      t.deepEqual(key, '/test/bar');
      cb(null, {
        action: 'set',
        node: {
          key,
          dir: true,
          nodes: []
        }
      }, null);
    }
  }, join(__dirname, 'fixtures/fs/bar'), '/test/bar').toArray().toPromise().then(events => {
    t.deepEqual(events, ['baz']);
    t.plan(4);
  });
});

test('should update file if it\'s outdated', t => {
  return syncFile$({
    get: (key, cb) => {
      t.deepEqual(key, '/test/foo');
      cb(null, {
        action: 'get',
        node: {
          key,
          value: 'bar'
        }
      }, null);
    },
    set: (key, value, cb) => {
      t.deepEqual(key, '/test/foo');
      t.deepEqual(value, 'foo');
      cb(null, {
        action: 'set',
        node: {
          key,
          value
        },
        prevNode: {
          key,
          value: 'bar'
        }
      }, null, null);
    }
  }, join(__dirname, 'fixtures/fs/foo'), '/test/foo').toArray().toPromise().then(events => {
    t.deepEqual(events, []);
    t.plan(4);
  });
});

test('shouldn\'t update file if it\'s updated', t => {
  return syncFile$({
    get: (key, cb) => {
      t.deepEqual(key, '/test/foo');
      cb(null, {
        action: 'get',
        node: {
          key,
          value: 'foo'
        }
      }, null);
    },
    set: (key, value, cb) => {
      t.fail();
    }
  }, join(__dirname, 'fixtures/fs/foo'), '/test/foo').toArray().toPromise().then(events => {
    t.deepEqual(events, []);
    t.plan(2);
  });
});

test('should loop on sync', t => {
  return sync$({
    get: (key, cb) => {
      t.pass();
      if (key === '/test')
        return cb(null, {
          action: 'get',
          node: {
            key,
            dir: true
          }
        }, null);
      const err = new Error();
      err.errorCode = 100;
      cb(err, null, null);
    },
    set: (key, value, cb) => {
      t.pass();
      cb(null, {
        action: 'set',
        node: {
          key,
          value
        }
      });
    },
    mkdir: (key, cb) => {
      t.pass();
      cb(null, {
        action: 'set',
        node: {
          key,
          dir: true,
          nodes: []
        }
      }, null);
    }
  }, join(__dirname, 'fixtures/fs'), '/test').toPromise().then(() => {
    t.plan(7);
  });
});
