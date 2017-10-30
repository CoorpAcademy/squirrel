#! /usr/bin/env node

import {resolve} from 'path';
import minimist from 'minimist';
import {sync$} from '../util/cli';
import makeEtcdClient from './etcd';

const argz = minimist(process.argv.slice(2));

const pathFS = resolve(process.cwd(), argz._[0]);
const pathETCD = resolve('/', argz._[1]);

const client = makeEtcdClient(argz);

sync$(client, pathFS, pathETCD)
  .toPromise()
  .then(() => process.stdout.write('The end.\n'))
  .catch(err => process.stderr.write(`${err.stack}\n`));
