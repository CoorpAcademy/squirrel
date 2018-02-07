import {writeFile} from 'fs';
import {Observable} from 'rxjs';
import createDebug from 'debug';

const debug = createDebug('squirrel:save');

const writeFile$ = Observable.bindNodeCallback(writeFile);
const stringify = v => JSON.stringify(v, null, 2);

const createSaver$ = savePath => records$ => {
  if (typeof savePath !== 'string') return records$;

  return records$.concatMap(records =>
    writeFile$(savePath, stringify(records), {encoding: 'UTF8'})
      .do(() => debug(`saved ${savePath}`))
      .mapTo(records)
  );
};

export default createSaver$;
