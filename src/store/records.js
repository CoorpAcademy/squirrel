import {Observable} from 'rxjs';
import {identity} from 'lodash/fp';
import createWatcher$ from '../etcd/watch';
import createFetch$ from '../etcd/fetch';
import createRestorer$ from '../fs/restorer';
import createSaver$ from '../fs/saver';
import createReducer$ from './reducer';

const createRecords$ = (client, {fallback, preloadedStore, save} = {}) => {
  const command$ = Observable.of(createRestorer$(fallback, preloadedStore), createFetch$(client))
    .concatAll()
    .concat(createWatcher$(client));

  const records$ = command$.pipe(
    createReducer$,
    save ? createSaver$(fallback) : identity
  );

  return records$;
};

export default createRecords$;
