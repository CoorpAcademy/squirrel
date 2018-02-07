import {tmpdir} from 'os';
import {join} from 'path';
import {promisify} from 'util';
import {readFile} from 'fs';
import test from 'ava';
import {Etcd3} from 'etcd3';
import save from '../save';

const readFileP = promisify(readFile);

test('should create save file', async t => {
  const tmpFile = join(tmpdir(), `squirrel-test-save-${Date.now()}.json`);

  const client = new Etcd3();
  client.mock({
    exec: (...argz) =>
      Promise.resolve({
        kvs: [
          {
            key: Buffer.from('foo'),
            value: Buffer.from('{"foo": "foo"}'),
            mod_revision: '1'
          },
          {
            key: Buffer.from('bar'),
            value: Buffer.from('{"bar": "bar"}'),
            mod_revision: '1'
          }
        ]
      })
  });

  await save(client, tmpFile);

  t.deepEqual(JSON.parse(await readFileP(tmpFile, {encoding: 'utf8'})), {
    bar: {
      key: 'bar',
      value: {
        bar: 'bar'
      },
      version: '1'
    },
    foo: {
      key: 'foo',
      value: {
        foo: 'foo'
      },
      version: '1'
    }
  });
});
