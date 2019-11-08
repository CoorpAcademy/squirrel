#! /usr/bin/env node

import minimist from 'minimist';
import createEtcd from './helper/etcd';
import watch from './helper/watch';

const argz = minimist(process.argv.slice(2));

const namespace = argz._[0] || '';

const client = createEtcd(argz);
const namespacedClient = client.namespace(namespace);

watch(namespacedClient).catch(console.error);
