import {tmpdir} from 'os';
import {join} from 'path';
import {promisify} from 'util';
import {readFile, readdir} from 'fs';
import test from 'ava';
import {Etcd3} from 'etcd3';
import dump from '../dump';

const readFileP = promisify(readFile);
const readdirP = promisify(readdir);

test('should create dump dir', async t => {
  const tmpPath = join(tmpdir(), `squirrel-test-dump-${Date.now()}`);

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

  await dump(client, tmpPath);

  t.deepEqual(await readdirP(tmpPath), ['bar', 'foo']);

  t.deepEqual(await readFileP(join(tmpPath, 'foo'), {encoding: 'utf8'}), '{\n  "foo": "foo"\n}');
  t.deepEqual(await readFileP(join(tmpPath, 'bar'), {encoding: 'utf8'}), '{\n  "bar": "bar"\n}');
});
