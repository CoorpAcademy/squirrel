import {Observable} from 'rxjs';
import {parseAction} from './parse';

const createWatcher$ = (client, cwd) => {
  return Observable.create(observer => {
    const watcher = client.watcher(cwd, null, {recursive: true});

    const set$ = Observable.fromEvent(watcher, 'set');
    const delete$ = Observable.fromEvent(watcher, 'delete');
    const reSync$ = Observable.fromEvent(watcher, 'resync');
    observer.next(set$);
    observer.next(delete$);
    observer.next(reSync$);

    // Provide a way of canceling and disposing the interval resource
    return () => {
      watcher.stop();
    };
  }).mergeAll().map(parseAction);
};

export default createWatcher$;
