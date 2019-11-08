#! /usr/bin/env node

import {resolve} from 'path';
import {argv} from 'yargs';
import createEtcd from './helper/etcd';
import restore from './helper/restore';

const inDir = resolve(process.cwd(), argv._[0]);
const namespace = argv._[1] || '';

const client = createEtcd(argv);
const namespacedClient = client.namespace(namespace);

restore(namespacedClient, inDir).catch(console.error);
