#! /usr/bin/env node

import {resolve} from 'path';
import minimist from 'minimist';

import makeEtcdClient from './etcd';
import createWatcher$ from '../watch';

const argz = minimist(process.argv.slice(2));

const pathETCD = resolve('/', argz._[0]);

const client = makeEtcdClient(argz);

const watcher = client.watcher(pathETCD, null, {recursive: true});
createWatcher$(watcher).do(action =>
  process.stdout.write(`${JSON.stringify(action, null, 4)}\n`)
).toPromise();
