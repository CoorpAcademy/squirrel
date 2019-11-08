#! /usr/bin/env node

import {resolve} from 'path';
import {argv} from 'yargs';
import createEtcd from './helper/etcd';
import save from './helper/save';

const outDir = resolve(process.cwd(), argv._[0]);
const namespace = argv._[1] || '';

const client = createEtcd(argv);
const namespacedClient = client.namespace(namespace);
save(namespacedClient, outDir).catch(console.error);
