import {assign, pick} from 'lodash/fp';
import Etcd from 'node-etcd';
import {Observable} from 'rxjs';

import {createEtcd$} from './etcd';
import createCombiner$ from './combiner';
import createFallback$ from './fallback';
import createSave from './save';
import createIndexer from './indexer';
import createClient from './client';

const createSquirrel = options => {
  options = assign({
    hosts: 'http://localhost:2379',
    auth: null,
    ca: null,
    key: null,
    cert: null,
    fallback: null,

    cwd: '/',
    indexes: []
  }, options);

  const client = new Etcd(options.hosts, pick(['auth', 'ca', 'key', 'cert'], options));
  const watcher = client.watcher(options.cwd, null, {recursive: true});
  const save = createSave(options.fallback);

  const events$ = Observable.concat(
    createFallback$(options.fallback),
    createEtcd$(client, watcher, options.cwd)
  );

  const store$ = save(createCombiner$(events$));
  const indexer = createIndexer(options.indexes);

  const subscription = events$.subscribe();

  subscription.add(() => watcher.stop());

  return {
    ...createClient(store$, indexer),
    close: () => subscription.unsubscribe()
  };
};

export {
  createSquirrel
};
