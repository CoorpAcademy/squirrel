import {
  assign,
  pick
} from 'lodash/fp';
import Etcd from 'node-etcd';
import {Observable} from 'rxjs';
import createDebug from 'debug';

import {createEtcd$} from './etcd';
import createFallback$ from './fallback';
import createCombiner$ from './combiner';
import createStore from './store';
import createAPI from './api';

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

  const events$ = Observable.concat(
    createFallback$(options.fallback),
    createEtcd$(client, watcher, options.cwd)
  );

  const combiner$ = createCombiner$(events$);
  const {store, subscription} = createStore(options, combiner$, watcher);
  const api = createAPI(store);

  return {
    ...api,
    close: () => subscription.unsubscribe()
  };
};

module.exports = createSquirrel;
