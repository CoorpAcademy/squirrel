import {Observable} from 'rxjs';
import createDebug from 'debug';
import createFetcher$ from './fetch';

const debug = createDebug('squirrel:etcd');

const createResync$ = (client, cwd, events$) =>
  events$
    .map(action => {
      if (action.action === 'resync') {
        debug('watcher: resync');
        return createFetcher$(client, cwd);
      }
      return Observable.of(action);
    })
    .concatAll();

export default createResync$;
