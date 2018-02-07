#! /usr/bin/env node

import {resolve} from 'path';
import minimist from 'minimist';
import createEtcd from './helper/etcd';
import restore from './helper/restore';

const argz = minimist(process.argv.slice(2));

const inDir = resolve(process.cwd(), argz._[0]);
const namespace = argz._[1] || '';

const client = createEtcd(argz);
const namespacedClient = client.namespace(namespace);

restore(namespacedClient, inDir).catch(console.error); // eslint-disable-line no-console
