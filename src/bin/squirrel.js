#! /usr/bin/env node

import {resolve} from 'path';
import yargs from 'yargs';
import createEtcd from './helper/etcd';
import dump from './helper/dump';
import watch from './helper/watch';
import save from './helper/save';
import restore from './helper/restore';

const {argv} = yargs
  .usage('./$0 <sub-command> [...args]')
  .command('save <out> [namespace]')
  .command('restore <out> [namespace]')
  .command('dump <out> [namespace]')
  .command('watch [namespace]')
  .option('hosts', {
    alias: 'h',
    describe: 'Etcd host (or comma separated list of hosts)'
  })
  .option('username', {
    alias: 'u',
    describe: 'Etcd user'
  })
  .option('password', {
    alias: 'p',
    describe: 'Etcd password'
  })
  .option('root-certificate', {
    alias: 'ca',
    describe: 'Etcd user'
  });

const commands = {save, restore, dump, watch};

const handler = commands[argv._[0]];
if (!handler) {
  console.error(`Command ${argv._[0]} does not exit. Only: ${Object.keys(commands).join(', ')}`);
  process.exit(1);
}

const namespace = argv.namespace || '';
const outDir = argv.out ? resolve(process.cwd(), argv.out) : undefined;

const client = createEtcd(argv);
const namespacedClient = client.namespace(namespace);

handler(namespacedClient, outDir).catch(console.error);
