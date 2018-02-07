import {Observable} from 'rxjs';
import createFetch$ from './fetch';
import {createWatchCommand} from './command';

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
      const connected$ = Observable.fromEvent(watcher, 'connected');
      const resync$ = connected$.concatMap(() => createFetch$(client));

      const put$ = Observable.fromEvent(watcher, 'put');
      const delete$ = Observable.fromEvent(watcher, 'delete');
      const mutation$ = Observable.merge(put$, delete$).map(createWatchCommand);

      return Observable.merge(resync$, mutation$);
    });
};

export default createWatcher$;
