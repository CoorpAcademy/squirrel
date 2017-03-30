import {readFile} from 'fs';
import {isString, identity} from 'lodash/fp';
import {Observable} from 'rxjs';
import createDebug from 'debug';
import {parseAction} from './parse';

const debug = createDebug('squirrel:fallback');

const readFile$ = Observable.bindNodeCallback(readFile);

const wrapAction = data => ({
  action: 'get',
  node: data
});

const createFallback$ = filePath => {
  if (!isString(filePath)) return Observable.empty();
  debug(`Read fallback ${filePath}`);

  return readFile$(filePath, {
    encoding: 'UTF8'
  })
    .map(JSON.parse)
    .filter(identity)
    .map(wrapAction)
    .map(parseAction)
    .catch(() => Observable.empty());
};

export default createFallback$;
