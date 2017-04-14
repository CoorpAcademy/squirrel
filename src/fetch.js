import {Observable} from 'rxjs';
import createDebug from 'debug';
import {parseAction} from './parse';

const debug = createDebug('squirrel:etcd');

const createFetch$ = (client, cwd) => {
  debug(`fetch: ${cwd}`);
  const list = Observable.bindNodeCallback(cb =>
    client.get(cwd, {recursive: true}, (err, data) => cb(err, data))
  );

  return Observable.of(list).map(f => f()).mergeAll().retry(Infinity).map(parseAction);
};

export default createFetch$;
