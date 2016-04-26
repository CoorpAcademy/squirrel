import {readFile} from 'fs';
import {isString} from 'lodash/fp';
import {Observable} from 'rxjs';
import {parseAction} from './parser';
import createDebug from 'debug';
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
  }).map(JSON.parse).map(wrapAction).map(parseAction);
};

export default createFallback$;
