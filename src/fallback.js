import {readFile} from 'fs';
import {isString} from 'lodash/fp';
import {Observable} from 'rxjs';

const readFile$ = Observable.bindNodeCallback(readFile);

const wrapAction = data => ({
  action: 'get',
  node: data
});

const createFallback$ = filePath => {
  if (!isString(filePath)) return Observable.empty();
  return readFile$(filePath, {
    encoding: 'UTF8'
  }).map(JSON.parse).map(wrapAction);
};

export default createFallback$;
