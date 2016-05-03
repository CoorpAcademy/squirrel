const createStore = (node$, indexer) => {
  const store$ = node$.map(node => ({
    node,
    indexes: indexer(node)
  }));

  let store = null;
   const storeReady = store$.take(1).do(_store => {
    store = _store;
  }).toPromise();
  const observable = store$.do(_store => {
    store = _store;
  });

  const ready = key => storeReady.then(() => store[key]);

  return {
    store: ready,
    observable
  };
};

export default createStore;
