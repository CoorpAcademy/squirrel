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

  // GRPC
  retry = true,
  grpcOptions = {
    'grpc.http2.max_ping_strikes': 1
  }
} = {}) => {
  debug('Init');

  const client = new Etcd3({
    hosts,
    auth,
    credentials,
    retry,
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
