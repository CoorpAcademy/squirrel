const createStore = (node$, indexer) => {
  const store$ = node$.map(node => ({
    node,
    indexes: indexer(node)
  }));

  const replayed$ = store$.publishLast();

  const ready = key => replayed$.first().pluck(key).toPromise();

  return {
    store: ready,
    subscription: replayed$.connect()
  };
};

export default createStore;
