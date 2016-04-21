import path from 'path';
import {has, get as get_, keys, find, startsWith} from 'lodash/fp';
import {Observable} from 'rxjs';

const createClient = (store$, indexer) => {
  const indexer$ = store$.map(indexer);

  const getBy = (index, key) => {
    return Observable.of(index)
      .withLatestFrom(indexer$, (index, indexes) => {
        return has(key, indexes[index]) ?
        get_(key, indexes[index]).value :
        null;
      }).toPromise();
  };

  const getAll = index => {
    return Observable.of(index)
      .withLatestFrom(indexer$, (index, indexes) =>
        keys(indexes && indexes[index])
      ).toPromise();
  };

  const get = path => {
    return Observable.of(path)
      .withLatestFrom(store$.startWith(null), (path, store) => {
        return _get(path, store);
      }).toPromise();
  };

  const _get = (_path, node) => {
      if (!node) return null;
      if (path.relative(node.key, _path) === '') return node;

      return _get(_path, find(function(child) {
          return startsWith(child.key, _path);
      }, node.nodes));
  };

  return {
    getBy,
    getAll,
    get
  };
};

export default createClient;
