import {writeFile} from 'fs';
import {Observable} from 'rxjs';
import {isString} from 'lodash/fp';

const writeFile$ = Observable.bindNodeCallback(writeFile);

const stringify = obj => JSON.stringify(obj, null, 2);

const createSave = filePath => event$ => {
  if (!isString(filePath)) return event$;

  return event$.delayWhen(event =>
    writeFile$(
      filePath,
      stringify(event),
      {encoding: 'UTF8'}
    )
  );
};

export default createSave;
