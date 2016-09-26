import path from 'path';
import {
  find,
  getOr,
  keys,
  startsWith,
  curry
} from 'lodash/fp';
import {set$} from './util/etcd';
import createDebug from 'debug';

const debug = createDebug('squirrel');

const createAPI = (store, client) => {
  const getBy = (index, key) => {
    debug(`getBy: ${index} => ${key}`);
    return store('indexes').then(getOr(null, [index, key, 'value']));
  };

  const getAll = index => {
    debug(`getAll => ${index}`);
    return store('indexes').then(indexes => {
      return keys(indexes && indexes[index]);
    });
  };

  const get = path => {
    debug(`get => ${path}`);
    return store('node').then(_get(path));
  };

  const set = (_path, value) => {
    return set$(client, _path, value).toPromise();
  };

  const _get = curry((_path, node) => {
    if (!node) return null;
    if (path.relative(node.key, _path) === '') return node;

    return _get(_path, find(function(child) {
      return startsWith(child.key, _path);
    }, node.nodes));
  });

  return {
    getBy,
    getAll,
    get,
    set
  };
};

export default createAPI;
