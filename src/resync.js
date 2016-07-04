import {Observable} from 'rxjs';
import createFetcher$ from './fetch';
import createDebug from 'debug';
const debug = createDebug('squirrel:etcd');

const createResync$ = (client, cwd, events$) =>
  events$.map(action => {
    if (action.action === 'resync') {
      debug('watcher: resync');
      return createFetcher$(client, cwd);
    }
    return Observable.of(action);
  }).concatAll();

export default createResync$;
