#! /usr/bin/env node

import {resolve} from 'path';
import minimist from 'minimist';
import createFetch$ from '../fetch';
import createSave from '../save';
import makeEtcdClient from './etcd';

const argz = minimist(process.argv.slice(2));

const pathETCD = resolve('/', argz._[0]);
const pathFS = resolve(process.cwd(), argz._[1]);

const client = makeEtcdClient(argz);

const fetch$ = createFetch$(client, pathETCD).pluck('node');

createSave(pathFS)(fetch$)
  .toPromise()
  .then(() => process.stdout.write('The end.\n'))
  .catch(err => process.stderr.write(`${err.stack}\n`));
