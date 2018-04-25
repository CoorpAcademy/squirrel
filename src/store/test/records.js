import {tmpdir} from 'os';
import {join} from 'path';
import {Duplex} from 'stream';
import {readFile, exists} from 'fs';
import test from 'ava';
import {Etcd3} from '@coorpacademy/etcd3';
import {Observable} from 'rxjs';
import createRecords$ from '../records';

const readFile$ = Observable.bindNodeCallback(readFile);
const exists$ = Observable.bindCallback(exists);

test('should combine data sources', async t => {
  const client = new Etcd3();

  const fallback = join(__dirname, 'nope.json');
  const preloadedStore = Promise.resolve({
    foo: {
      key: 'foo',
      value: 'foo',
      version: '1'
    }
  });

  const created = {
    header: {
      revision: '1'
    },
    watch_id: '1',
    created: true
  };
  const updated = {
    header: {
      revision: '2'
    },
    watch_id: '1',
    events: [
      {
        type: 'Put',
        kv: {
          key: Buffer.from('foo'),
          mod_revision: '3',
          value: Buffer.from('foo')
        },
        prev_kv: null
      }
    ]
  };

  const canceled = {
    header: {
      revision: '3'
    },
    watch_id: '1',
    canceled: true,
    cancel_reason: ''
  };

  const watchEvents = [updated];
  const errors = [new Error()];

  const createStream = () => {
    const stream = new Duplex({
      objectMode: true,
      write(chunk, encoding, cb) {
        if (chunk.create_request) this.push(created);
        if (chunk.cancel_request) this.push(canceled);
        cb();
      },
      read(size) {
        setTimeout(() => {
          if (watchEvents.length > 0) return this.push(watchEvents.shift());
          if (errors.length > 0) return this.emit('error', errors.shift());
        }, 0);
      }
    });
    stream.cancel = () => {
      stream.end();
    };
    return stream;
  };

  const fetchEvents = [
    {
      kvs: [
        {
          key: Buffer.from('foo'),
          value: Buffer.from('foo'),
          mod_revision: '2'
        }
      ]
    },
    {
      kvs: [
        {
          key: Buffer.from('foo'),
          value: Buffer.from('foo'),
          mod_revision: '4'
        }
      ]
    }
  ];

  client.mock({
    exec: (...argz) => Promise.resolve(fetchEvents.shift()),

    getConnection: (...argv) => {
      return Promise.resolve({
        client: {
          watch: createStream
        }
      });
    }
  });

  const records$ = createRecords$(client, {fallback, preloadedStore, save: false});

  const expected = [
    {
      foo: {
        key: 'foo',
        value: 'foo',
        version: '1'
      }
    },
    {
      foo: {
        key: 'foo',
        value: 'foo',
        version: '2'
      }
    },
    {
      foo: {
        key: 'foo',
        value: 'foo',
        version: '3'
      }
    },
    {
      foo: {
        key: 'foo',
        value: 'foo',
        version: '4'
      }
    }
  ];
  const actual = await records$
    .take(4)
    .toArray()
    .toPromise();
  t.deepEqual(actual, expected);

  client.unmock();
});

test('should write file', async t => {
  const fallback = join(tmpdir(), `squirrel-test-${Date.now()}.json`);

  const preloadedStore = Promise.resolve({
    foo: {
      key: 'foo',
      value: 'foo',
      version: '1'
    }
  });

  t.false(await exists$(fallback).toPromise());

  const client = new Etcd3();
  const records$ = createRecords$(client, {fallback, preloadedStore, save: true});

  await records$.take(1).toPromise();

  const actual = await readFile$(fallback, {encoding: 'UTF8'})
    .map(JSON.parse)
    .toPromise();
  const expected = {
    foo: {
      key: 'foo',
      value: 'foo',
      version: '1'
    }
  };

  t.deepEqual(actual, expected);
});

test('should ignore fallback and preloaderStore if they are not defined', async t => {
  const client = new Etcd3();
  const fetchEvents = [
    {
      kvs: [
        {
          key: Buffer.from('foo'),
          value: Buffer.from('foo'),
          mod_revision: '1'
        }
      ]
    }
  ];

  client.mock({
    exec: (...argz) => Promise.resolve(fetchEvents.shift())
  });

  const records$ = createRecords$(client);
  const expected = [
    {
      foo: {
        key: 'foo',
        value: 'foo',
        version: '1'
      }
    }
  ];
  const actual = await records$
    .take(1)
    .toArray()
    .toPromise();
  t.deepEqual(actual, expected);
});
