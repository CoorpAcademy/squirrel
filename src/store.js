import createDebug from 'debug';
import {
  identity
} from 'lodash/fp';
import createSave from './save';
import createIndexer from './indexer';
const debug = createDebug('squirrel');

const createStore = (options, combiner$, watcher) => {
  const indexer = createIndexer(options.indexes);

  const save = options.save ? createSave(options.fallback) : identity;

  const store$ = save(combiner$).map(node => ({
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

  return {
    store: ready,
    subscription
  };
};

export default createStore;
