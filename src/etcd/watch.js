import {Observable} from 'rxjs';
import createDebug from 'debug';
import createFetch$ from './fetch';
import {createWatchCommand} from './command';

const debug = createDebug('squirrel:etcd:watch');

const createWatcher$ = client => {
  return Observable.create(observer => {
    const watcher$ = client
      .watch()
      .prefix('')
      .create();
    observer.next(watcher$);
    observer.complete();

    return async () => {
      const watcher = await watcher$;
      watcher.cancel();
    };
  })
    .mergeMap(p => Observable.fromPromise(p))
    .mergeMap(watcher => {
      const connected$ = Observable.fromEvent(watcher, 'connected').do(() =>
        debug(`Watcher is reconnected`)
      );
      const disconnected$ = Observable.fromEvent(watcher, 'disconnected')
        .do(() => debug(`Watcher is disconnected`))
        .ignoreElements();
      const connecting$ = Observable.fromEvent(watcher, 'connecting')
        .do(() => debug(`Watcher is connecting`))
        .ignoreElements();
      const resync$ = Observable.merge(connected$, disconnected$, connecting$).concatMap(() =>
        createFetch$(client)
      );

      const put$ = Observable.fromEvent(watcher, 'put').do(record =>
        debug(`%o was updated to v%i`, record.key.toString('utf8'), record.mod_revision)
      );
      const delete$ = Observable.fromEvent(watcher, 'delete').do(record =>
        debug(`%o was removed`, record.key.toString('utf8'))
      );
      const mutation$ = Observable.merge(put$, delete$).map(createWatchCommand);

      return Observable.merge(resync$, mutation$);
    });
};

export default createWatcher$;
