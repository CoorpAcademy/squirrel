import {writeFile} from 'fs';
import {Observable} from 'rxjs';
import {isString} from 'lodash/fp';
import createDebug from 'debug';
import {stringify} from './parse';
const debug = createDebug('squirrel:save');

const writeFile$ = Observable.bindNodeCallback(writeFile);

const createSave = filePath => event$ => {
  if (!isString(filePath)) return event$;

  return event$.delayWhen(event => {
    debug(`saving ${filePath}`);
    return writeFile$(
      filePath,
      stringify(event),
      {encoding: 'UTF8'}
    ).do(() =>
      debug(`saved ${filePath}`)
    );
  });
};

export default createSave;
