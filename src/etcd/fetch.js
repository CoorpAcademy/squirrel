import {Observable} from 'rxjs';
import {pipe, get, size} from 'lodash/fp';
import createDebug from 'debug';
import {createFetchCommand} from './command';

const debug = createDebug('squirrel:etcd:fetch');
const error = createDebug('squirrel:etcd:fetch:error');

const createFetch$ = client => {
  return Observable.defer(() => Observable.fromPromise(client.getAll().exec()))
    .do(records =>
      debug(
        `Fetch ${pipe(
          get('kvs'),
          size
        )(records)} records from ETCD`
      )
    )
    .map(createFetchCommand)
    .catch(err => error('Fail to fetch records from ETCD', err))
    .retry(Infinity);
};

export default createFetch$;
