import path from 'path';
import {
  find,
  getOr,
  keys,
  startsWith,
  curry
} from 'lodash/fp';
import {stringify, parseValue} from './parse';
import {set$} from './util/etcd';
import createDebug from 'debug';

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

  const get = path => {
    debug(`get => ${path}`);
    return store('node').then(_get(path));
  };

  const set = (_path, value) => {
    _path = path.join(options.cwd, _path);
    debug(`set => ${_path}`);
    return set$(client, _path, stringify(value))
        .pluck('node', 'value')
        .map(parseValue)
        .toPromise();
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
    getByRaw,
    getAll,
    get,
    set
  };
};

export default createAPI;
