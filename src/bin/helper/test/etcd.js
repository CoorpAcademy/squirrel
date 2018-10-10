import {readFileSync} from 'fs';
import {join} from 'path';
import test from 'ava';
import createEtcd from '../etcd';

test('should create Etcd3 client', t => {
  const client = createEtcd();

  t.truthy(client.pool.options.hosts);
  t.falsy(client.pool.options.auth);
  t.falsy(client.pool.options.credentials);
});

test('should create Etcd3 client with options', t => {
  const hosts = 'https://localhost:1,https://localhost:2';
  const username = 'root';
  const password = 'admin';
  const rootCertificate = readFileSync(join(__dirname, 'fixtures/etcd.ca'));

  const client = createEtcd({
    hosts,
    username,
    password,
    rootCertificate
  });

  t.deepEqual(client.pool.options.hosts, hosts.split(','));
  t.deepEqual(client.pool.options.auth, {
    username,
    password
  });
  t.deepEqual(client.pool.options.credentials, {
    rootCertificate: Buffer.from(rootCertificate)
  });
});
