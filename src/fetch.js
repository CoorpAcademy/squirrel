import {Observable} from 'rxjs';
import {parseAction} from './parse';
import createDebug from 'debug';
const debug = createDebug('squirrel:etcd');

const createFetch$ = (client, cwd) => {
  debug(`fetch: ${cwd}`);
  const list = Observable.bindNodeCallback(
    cb => client.get(cwd, {recursive: true}, (err, data) => cb(err, data))
  );

  return Observable.of(1)
    .flatMap(() => list())
    .retry(Infinity)
    .map(parseAction);
};

export default createFetch$;
