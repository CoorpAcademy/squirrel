import {Observable} from 'rxjs';
import makeDebug from 'debug';
const debug = makeDebug('squirrel:util:etcd');

export const compareAndSwap$ = (client, ...argz) =>
  debug('compareAndSwap', ...argz) ||
  Observable.bindNodeCallback(client.compareAndSwap.bind(client))(...argz).pluck(0);

export const del$ = (client, ...argz) =>
  debug('del', ...argz) ||
  Observable.bindNodeCallback(client.del.bind(client))(...argz).pluck(0);

export const delRecursive$ = (client, key) =>
  debug('delRecursive', key) ||
  del$(client, key, {recursive: true});

export const get$ = (client, ...argz) =>
  debug('get', ...argz) ||
  Observable.bindNodeCallback(client.get.bind(client))(...argz).pluck(0);

export const getRecursive$ = (client, key) =>
  debug('getRecursive', key) ||
  get$(client, key, {recursive: true});

export const mkdir$ = (client, ...argz) =>
  debug('mkdir', ...argz) ||
  Observable.bindNodeCallback(client.mkdir.bind(client))(...argz).pluck(0);

export const rmdir$ = (client, ...argz) =>
  debug('rmdir', ...argz) ||
  Observable.bindNodeCallback(client.rmdir.bind(client))(...argz).pluck(0);

export const rmdirRecursive$ = (client, key) =>
  debug('rmdirRecursive', key) ||
  rmdir$(client, key, {recursive: true});

export const set$ = (client, ...argz) =>
  debug('set', ...argz) ||
  Observable.bindNodeCallback(client.set.bind(client))(...argz).pluck(0);

export const isDirectory = node =>
  debug('isDirectory', node) ||
  !!(node && node.dir);

export const isFile = node =>
  debug('isFile', node) ||
  !!(node && !node.dir);
