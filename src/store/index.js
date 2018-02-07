import createIndexer from './indexer';

const createStore = (records$, indexes) => {
  const indexer = createIndexer(indexes);

  const store$ = records$.map(records => ({
    records,
    indexes: indexer(records)
  }));

  const replayed$ = store$.publishReplay(1);

  const ready = key =>
    replayed$
      .first()
      .pluck(key)
      .toPromise();

  return {
    store: ready,
    subscription: replayed$.connect()
  };
};

export default createStore;
