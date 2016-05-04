import {Observable} from 'rxjs';
import {parseAction} from './parse';

const createWatcher$ = watcher => {
  const set$ = Observable.fromEvent(watcher, 'set');
  const delete$ = Observable.fromEvent(watcher, 'delete');
  const reSync$ = Observable.fromEvent(watcher, 'resync');

  return Observable.merge(set$, delete$, reSync$)
    .map(parseAction);
};

export default createWatcher$;
