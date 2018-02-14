#! /usr/bin/env node

import {resolve} from 'path';
import minimist from 'minimist';
import createEtcd from './helper/etcd';
import dump from './helper/dump';

const argz = minimist(process.argv.slice(2));

const outDir = resolve(process.cwd(), argz._[0]);
const namespace = argz._[1] || '';

const client = createEtcd(argz);
const namespacedClient = client.namespace(namespace);

dump(namespacedClient, outDir).catch(console.error);
