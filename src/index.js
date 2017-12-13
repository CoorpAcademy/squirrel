import {assign, identity, pick} from 'lodash/fp';
import Etcd from 'node-etcd';
import {Observable} from 'rxjs';
import createDebug from 'debug';
import createEtcd$ from './etcd';
import createFallback$ from './fallback';
import createCombiner$ from './combine';
import createStore from './store';
import createAPI from './api';
import createSave from './save';
import createIndexBuilder from './build-index';

const debug = createDebug('squirrel');

const createSquirrel = _options => {
  debug('Init');
  const options = assign(
    {
      hosts: 'http://localhost:2379',
      auth: null,
      ca: null,
      key: null,
      cert: null,
      fallback: null,
      preloadedStore: null,
      save: true,

      cwd: '/',
      indexes: []
    },
    _options
  );

  const client = new Etcd(options.hosts, pick(['auth', 'ca', 'key', 'cert'], options));
  const indexBuilder = createIndexBuilder(options.indexes);
  const save = options.save ? createSave(options.fallback) : identity;

  const events$ = Observable.concat(
    createFallback$(options.fallback, options.preloadedStore),
    createEtcd$(client, options.cwd)
  );

  const node$ = createCombiner$(events$);
  const {store, subscription} = createStore(save(node$), indexBuilder);
  const api = createAPI(store, client, options);

  return {
    ...api,
    close: () => subscription.unsubscribe()
  };
};

module.exports = createSquirrel;
