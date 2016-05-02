import path from 'path';
import {
  find,
  getOr,
  keys,
  startsWith
} from 'lodash/fp';
import createDebug from 'debug';

const debug = createDebug('squirrel');

const createAPI = store => {
  const getBy = (index, key) => {
    debug(`getBy: ${index} => ${key}`);
    return store('indexes').then(indexes =>
      getOr(null, [index, key, 'value'], indexes)
    );
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

  const _get = _path => node => {
    if (!node) return null;
    if (path.relative(node.key, _path) === '') return node;

    return _get(_path)(find(function(child) {
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
