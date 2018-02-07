import {Observable} from 'rxjs';
import createDebug from 'debug';
import {createFetchCommand} from './command';

const debug = createDebug('squirrel:etcd');

const createFetch$ = client => {
  debug(`fetch`);
  return Observable.defer(() => Observable.fromPromise(client.getAll().exec()))
    .map(createFetchCommand)
    .retry(Infinity);
};

export default createFetch$;
