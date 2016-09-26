import path from 'path';
import {
  find,
  getOr,
  keys,
  startsWith,
  curry
} from 'lodash/fp';
import createDebug from 'debug';

const debug = createDebug('squirrel');

const createAPI = (store, client, options = {cwd: '/'}) => {
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
    _path = path.join(options.cwd, _path);
    debug(`set => ${_path}`);
    return _set(_path, value);
  };

  const _get = curry((_path, node) => {
    if (!node) return null;
    if (path.relative(node.key, _path) === '') return node;

    return _get(_path, find(function(child) {
      return startsWith(child.key, _path);
    }, node.nodes));
  });

  const _set = (_path, value) => {
    return new Promise(function(resolve, reject) {
      if (!value) {
        return resolve(value);
      }
      client.set(_path, value, (err, res) => {
        if (err) {
          return reject(err);
        }

        return resolve(res);
      });
    });
  };

  return {
    getBy,
    getAll,
    get,
    set
  };
};

export default createAPI;
