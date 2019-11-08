#! /usr/bin/env node

import {resolve} from 'path';
import {argv} from 'yargs';
import createEtcd from './helper/etcd';
import dump from './helper/dump';
import watch from './helper/watch';
import save from './helper/save';
import restore from './helper/restore';

const commands = {
  dump,
  watch,
  save,
  restore
};

const handler = commands[argv._[0]];
if (!handler) {
  console.error(`Command ${argv._[0]} does not exit. Only: ${Object.keys(commands).join(', ')}`);
  process.exit(1);
}

const namespace = argv._[1] || '';
const outDir = argv.out ? resolve(process.cwd(), argv.out) : undefined;

const client = createEtcd(argv);
const namespacedClient = client.namespace(namespace);

handler(namespacedClient, outDir).catch(console.error);
