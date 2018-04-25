import {Duplex} from 'stream';
import test from 'ava';
import {Etcd3} from '@coorpacademy/etcd3';
import createWatcher$ from '../watch';

test('should create watcher observable', async t => {
  const client = new Etcd3();

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
        type: 'PUT',
        kv: {
          key: Buffer.from('foo'),
          mod_revision: '1',
          value: Buffer.from('bar')
        },
        prev_kv: null
      }
    ]
  };
  const deleted = {
    header: {
      revision: '3'
    },
    watch_id: '1',
    events: [
      {
        type: 'DELETE',
        kv: {
          key: Buffer.from('foo'),
          create_revision: '0',
          value: Buffer.from('')
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

  const events = [updated, deleted];
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
          if (events.length > 0) return this.push(events.shift());
          if (errors.length > 0) return this.emit('error', errors.shift());
        }, 0);
      }
    });
    stream.cancel = () => {
      stream.end();
    };
    return stream;
  };

  client.mock({
    exec: (...argv) => {
      return Promise.resolve({
        kvs: [
          {
            key: Buffer.from('foo'),
            value: Buffer.from('bar'),
            mod_revision: '1'
          }
        ]
      });
    },
    getConnection: (...argv) => {
      return Promise.resolve({
        client: {
          watch: createStream
        }
      });
    }
  });

  const watcher$ = createWatcher$(client);

  const actual = await watcher$
    .take(3)
    .toArray()
    .toPromise();

  const expected = [
    {
      type: 'watch',
      payload: [
        {
          key: 'foo',
          value: 'bar',
          version: '1'
        }
      ]
    },
    {
      type: 'watch',
      payload: [
        {
          key: 'foo'
        }
      ]
    },
    {
      type: 'fetch',
      payload: [
        {
          key: 'foo',
          value: 'bar',
          version: '1'
        }
      ]
    }
  ];

  t.deepEqual(actual, expected);
});
