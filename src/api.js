import {
    join,
    relative
} from 'path';
import {
  find,
  getOr,
  keys,
  startsWith,
  curry
} from 'lodash/fp';
import createDebug from 'debug';
import {set$} from './util/etcd';
import {stringify, parseValue} from './parse';

const debug = createDebug('squirrel');

const createAPI = (store, client, options = {cwd: '/'}) => {
  const getAll = index => {
    debug(`getAll => ${index}`);
    return store('indexes').then(indexes => {
      return keys(indexes && indexes[index]);
    });
  };

  const getByRaw = (index, key) => {
    debug(`getBy: ${index} => ${key}`);
    return store('indexes').then(getOr(null, [index, key]));
  };

  const getBy = (index, key) => {
    debug(`getBy: ${index} => ${key}`);
    return getByRaw(index, key).then(getOr(null, ['value']));
  };

  const _get = curry((_path, node) => {
    if (!node) return null;
    if (relative(node.key, _path) === '') return node;

    return _get(_path, find(function(child) {
      return startsWith(child.key, _path);
    }, node.nodes));
  });

  const get = path => {
    debug(`get => ${path}`);
    return store('node').then(_get(path));
  };

  const set = (_path, value) => {
    const fullPath = join(options.cwd, _path);
    debug(`set => ${fullPath}`);
    return set$(client, fullPath, stringify(value))
        .pluck('node', 'value')
        .map(parseValue)
        .toPromise();
  };

  return {
    getBy,
    getByRaw,
    getAll,
    get,
    set
  };
};

export default createAPI;
