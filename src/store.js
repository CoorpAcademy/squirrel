const createStore = (node$, indexer) => {
  const store$ = node$.map(node => ({
    node,
    indexes: indexer(node)
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
