import {getOr, keys, pipe} from 'lodash/fp';
import createDebug from 'debug';

const debug = createDebug('squirrel');

const createAPI = (store, client) => {
  const getAll = index => {
    debug(`getAll => ${index}`);
    return store('indexes').then(
      pipe(
        getOr({}, index),
        keys
      )
    );
  };

  const getByRaw = (index, key) => {
    debug(`getBy: ${index} => ${key}`);
    return store('indexes').then(getOr(null, [index, key]));
  };

  const getBy = (index, key) => {
    debug(`getBy: ${index} => ${key}`);
    return getByRaw(index, key).then(getOr(null, ['value']));
  };

  const get = key => {
    debug(`get => ${key}`);
    return store('records').then(getOr(null, key));
  };

  const set = (key, value) => {
    debug(`set => ${key}`);
    return client
      .put(key)
      .value(JSON.stringify(value))
      .then(() => value);
  };

  const del = key => {
    debug(`del => ${key}`);
    return client.delete().key(key);
  };

  return {
    getBy,
    getByRaw,
    getAll,
    get,
    set,
    del
  };
};

export default createAPI;
