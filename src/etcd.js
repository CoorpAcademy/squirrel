import {Observable} from 'rxjs';
import {parseAction} from './parser';
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

const createWatcher$ = watcher => {
  const set$ = Observable.fromEvent(watcher, 'set');
  const delete$ = Observable.fromEvent(watcher, 'delete');
  const reSync$ = Observable.fromEvent(watcher, 'resync');

  return Observable.merge(set$, delete$, reSync$)
    .map(parseAction);
};

const createEtcd$ = (client, watcher, cwd) => {
  const watcher$ = createWatcher$(watcher);

  const events$ = watcher$.startWith({
    action: 'resync'
  }).flatMap(action => {
    if (action.action === 'resync') {
      debug('watcher: resync');
      return createFetch$(client, cwd);
    }
    return Observable.of(action);
  });

  return events$;
};

export {
  createFetch$,
  createWatcher$,
  createEtcd$
};
