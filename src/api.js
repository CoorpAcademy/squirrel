import path from 'path';
import {
  find,
  get as get_,
  has,
  keys,
  startsWith
} from 'lodash/fp';
import createDebug from 'debug';

const debug = createDebug('squirrel');

const createAPI = store => {
  const getBy = (index, key) => {
    debug(`getBy: ${index} => ${key}`);
    return store('indexes').then(indexes => {
      return has(key, indexes[index]) ?
      get_(key, indexes[index]).value :
      null;
    });
  };

  const getAll = index => {
    debug(`getAll => ${index}`);
    return store('indexes').then(indexes => {
      return keys(indexes && indexes[index]);
    });
  };

  const get = path => {
    debug(`get => ${path}`);
    return store('node').then(node => {
      return _get(path, node);
    });
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

export default createAPI;
