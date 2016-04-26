import path from 'path';
import {
  assign,
  find,
  get as get_,
  has,
  identity,
  keys,
  pick,
  startsWith
} from 'lodash/fp';
import Etcd from 'node-etcd';
import {Observable} from 'rxjs';
import createDebug from 'debug';

import {createEtcd$} from './etcd';
import createCombiner$ from './combiner';
import createFallback$ from './fallback';
import createSave from './save';
import createIndexer from './indexer';

const debug = createDebug('squirrel');

const createSquirrel = options => {
  debug('Init');
  options = assign({
    hosts: 'http://localhost:2379',
    auth: null,
    ca: null,
    key: null,
    cert: null,
    fallback: null,
    save: true,

    cwd: '/',
    indexes: []
  }, options);

  const client = new Etcd(options.hosts, pick(['auth', 'ca', 'key', 'cert'], options));
  const watcher = client.watcher(options.cwd, null, {recursive: true});
  const save = options.save ? createSave(options.fallback) : identity;
  const indexer = createIndexer(options.indexes);

  const events$ = Observable.concat(
    createFallback$(options.fallback),
    createEtcd$(client, watcher, options.cwd)
  );

  const store$ = save(createCombiner$(events$)).map(node => ({
    node,
    indexes: indexer(node)
  }));

  let store = null;
  const storeReady = store$.take(1).do(_store => {
    store = _store;
  }).toPromise();
  const subscription = store$.subscribe(_store => {
    store = _store;
  });

  subscription.add(() => {
    debug('Unsubscribe');
    watcher.stop();
  });

  const ready = key => storeReady.then(() => store[key]);

  const getBy = (index, key) => {
    debug(`getBy: ${index} => ${key}`);
    return ready('indexes').then(indexes => {
      return has(key, indexes[index]) ?
      get_(key, indexes[index]).value :
      null;
    });
  };

  const getAll = index => {
    debug(`getAll => ${index}`);
    return ready('indexes').then(indexes => {
      return keys(indexes && indexes[index]);
    });
  };

  const get = path => {
    debug(`get => ${path}`);
    return ready('node').then(node => {
      return _get(path, node);
    });
  };

  const _get = (_path, node) => {
    if (!node) return null;
    if (path.relative(node.key, _path) === '') return node;

    return _get(_path, find(function(child) {
      return startsWith(child.key, _path);
    }, node.nodes));
  };

  return {
    getBy,
    getAll,
    get,
    close: () => subscription.unsubscribe()
  };
};

module.exports = createSquirrel;
