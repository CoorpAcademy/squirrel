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

const createFallback$ = (filePath, preloadedStore) => {
  debug(`Read fallback ${filePath}`);

  return readFile$(filePath, {
    encoding: 'UTF8'
  })
    .map(JSON.parse)
    .filter(identity)
    .map(wrapAction)
    .map(parseAction)
    .catch(() => (preloadedStore ? Observable.of(preloadedStore) : Observable.empty()));
};

export default createFallback$;
