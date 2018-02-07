import test from 'ava';
import {Etcd3} from 'etcd3';
import createFetch$ from '../fetch';

test('should fetch namespace and watch updates', async t => {
  const client = new Etcd3();
  client.mock({
    exec: (...argz) =>
      Promise.resolve({
        kvs: [
          {
            key: Buffer.from('bar'),
            value: Buffer.from('bar'),
            mod_revision: '1'
          }
        ]
      })
  });

  const fetch$ = createFetch$(client);

  const expected = [
    {
      type: 'fetch',
      payload: [
        {
          key: 'bar',
          value: 'bar',
          version: '1'
        }
      ]
    }
  ];
  const actual = await fetch$.toArray().toPromise();
  t.deepEqual(actual, expected);

  client.unmock();
});

const mockReturn = returns => () => returns.shift();

test('should retry on error', async t => {
  const client = new Etcd3();
  client.mock({
    exec: mockReturn([
      Promise.reject(new Error()),
      Promise.reject(new Error()),
      Promise.reject(new Error()),
      Promise.reject(new Error()),
      Promise.reject(new Error()),
      Promise.reject(new Error()),
      Promise.reject(new Error()),
      Promise.reject(new Error()),
      Promise.reject(new Error()),
      Promise.reject(new Error()),
      Promise.resolve({
        kvs: [
          {
            key: Buffer.from('bar'),
            value: Buffer.from('bar'),
            mod_revision: '1'
          }
        ]
      })
    ])
  });

  const fetch$ = createFetch$(client);

  await t.notThrows(fetch$.toPromise());

  client.unmock();
});
