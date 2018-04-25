import {join} from 'path';
import test from 'ava';
import {Etcd3} from '@coorpacademy/etcd3';
import restore from '../restore';

test('should restore dump dir', async t => {
  t.plan(6);

  const tmpPath = join(__dirname, 'fixtures/dump');

  const puts = {
    bar: {
      key: Buffer.from('bar'),
      value: Buffer.from('{\n    "bar": "bar"\n}')
    },
    foo: {
      key: Buffer.from('foo'),
      value: Buffer.from('{\n    "foo": "foo"\n}')
    }
  };

  const client = new Etcd3();
  client.mock({
    exec: (service, method, params) => {
      t.is(service, 'KV');
      t.is(method, 'put');
      const expected = puts[params.key.toString()];
      t.deepEqual(params, expected);
      return Promise.resolve();
    }
  });

  await restore(client, tmpPath);
});
