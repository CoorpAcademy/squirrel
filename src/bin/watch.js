#! /usr/bin/env node

import {argv} from 'yargs';
import createEtcd from './helper/etcd';
import watch from './helper/watch';

const namespace = argv._[0] || '';

const client = createEtcd(argv);
const namespacedClient = client.namespace(namespace);

watch(namespacedClient).catch(console.error);
