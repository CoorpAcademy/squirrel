import {readFile} from 'fs';
import {identity} from 'lodash/fp';
import {Observable} from 'rxjs';
import createDebug from 'debug';
import {parseAction} from './parse';

const debug = createDebug('squirrel:fallback');

const readFile$ = Observable.bindNodeCallback(readFile);

const wrapAction = data => ({
  action: 'get',
  node: data
});

const restorePreloadedStore = preloadedStore =>
  Observable.fromPromise(Promise.resolve(preloadedStore)).catch(() => Observable.empty());

const createFallback$ = (filePath, preloadedStore) => {
  debug(`Read fallback ${filePath}`);

  return readFile$(filePath, {
    encoding: 'UTF8'
  })
    .map(JSON.parse)
    .filter(identity)
    .catch(() => (preloadedStore ? restorePreloadedStore(preloadedStore) : Observable.empty()))
    .map(wrapAction)
    .map(parseAction);
};

export default createFallback$;
