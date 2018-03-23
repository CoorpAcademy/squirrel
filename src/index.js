import {Etcd3} from '@coorpacademy/etcd3';
import createDebug from 'debug';
import createRecords$ from './store/records';
import createStore from './store';
import createAPI from './api';

const debug = createDebug('squirrel');

const createSquirrel = ({
  // etcd
  hosts = ['http://127.0.0.1:2379'],
  credentials,
  auth,
  namespace = '',

  // fs
  fallback,
  preloadedStore,
  save = true,

  // index
  indexes = [],

  // ETCD3 lib options
  // see https://github.com/mixer/etcd3/blob/master/src/options.ts
  retry = false,
  dialTimeout = 30 * 1000,
  // grpc options
  // see https://grpc.io/grpc/cpp/group__grpc__arg__keys.html for available config keys
  // and https://github.com/mixer/etcd3/blob/master/src/types/grpc.d.ts for default values
  grpcOptions = {}
} = {}) => {
  debug('Init');

  const client = new Etcd3({
    hosts,
    auth,
    credentials,
    retry,
    dialTimeout,
    grpcOptions
  });

  const namespacedClient = namespace ? client.namespace(namespace) : client;
  const records$ = createRecords$(namespacedClient, {fallback, preloadedStore, save});
  const {store, subscription} = createStore(records$, indexes);
  const api = createAPI(store, namespacedClient);

  return {
    ...api,
    close: () => subscription.unsubscribe()
  };
};

export default createSquirrel;
