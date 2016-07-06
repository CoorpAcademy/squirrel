import {Observable} from 'rxjs';
import {invokeArgs} from 'lodash/fp';
import makeDebug from 'debug';
const debug = makeDebug('squirrel:util:etcd');

const wrap = fnName => (client, ...argz) =>
  debug(fnName, ...argz, client) ||
  Observable.create(observer => {
    const token = invokeArgs(fnName, [...argz, (err, value) => {
      if (err) return observer.error(err);
      observer.next(value);
      observer.complete();
    }], client);

    return () => {
      token.abort();
    };
  });

export const compareAndSwap$ = wrap('compareAndSwap');

export const del$ = wrap('del');

export const delRecursive$ = (client, key) =>
  debug('delRecursive', key) ||
  del$(client, key, {recursive: true});

export const get$ = wrap('get');

export const getRecursive$ = (client, key) =>
  debug('getRecursive', key) ||
  get$(client, key, {recursive: true});

export const mkdir$ = wrap('mkdir');

export const rmdir$ = wrap('rmdir');

export const rmdirRecursive$ = (client, key) =>
  debug('rmdirRecursive', key) ||
  rmdir$(client, key, {recursive: true});

export const set$ = wrap('set');

export const isDirectory = node =>
  debug('isDirectory', node) ||
  !!(node && node.dir);

export const isFile = node =>
  debug('isFile', node) ||
  !!(node && !node.dir);
