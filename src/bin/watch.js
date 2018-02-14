#! /usr/bin/env node

import minimist from 'minimist';
import createEtcd from './helper/etcd';

const argz = minimist(process.argv.slice(2));

const namespace = argz._[0] || '';

const client = createEtcd(argz);
const namespacedClient = client.namespace(namespace);

const watch = async () => {
  const watcher = await namespacedClient
    .watch()
    .prefix('')
    .create();

  const putHandler = kv => console.log(`PUT ${kv.key.toString()} = ${kv.value.toString()}`);
  watcher.on('put', putHandler);

  const delHandler = kv => console.log(`DEL ${kv.key.toString()}`);
  watcher.on('del', delHandler);

  const handle = async () => {
    await watcher.cancel();
    client.close();
  };

  process.on('SIGINT', handle);
  process.on('SIGTERM', handle);

  return new Promise(resolve => watcher.once('end', resolve));
};

watch().catch(console.error);
