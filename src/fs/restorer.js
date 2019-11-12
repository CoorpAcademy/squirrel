import {readFile} from 'fs';
import {identity, values} from 'lodash/fp';
import {Observable} from 'rxjs';
import createDebug from 'debug';

const debug = createDebug('squirrel:fallback');
const readFile$ = Observable.bindNodeCallback(readFile);

const restorePreloadedStore = preloadedStore =>
  Observable.fromPromise(Promise.resolve(preloadedStore)).catch(() => Observable.empty());

const parseToEvent = store => ({
  type: 'fetch',
  payload: values(store)
});

const createRestorer$ = (filePath, preloadedStore) => {
  return readFile$(filePath, {
    encoding: 'UTF8'
  })
    .map(JSON.parse)
    .filter(identity)
    .do(() => debug(`Restore from file: ${filePath}`))
    .catch(() =>
      preloadedStore
        ? restorePreloadedStore(preloadedStore).do(() => debug('Restore from preloadedStore'))
        : Observable.empty()
    )
    .map(parseToEvent);
};

export default createRestorer$;
