import {Observable} from 'rxjs';
import createWatcher$ from './watch';
import createResync$ from './resync';

const createEtcd$ = (client, cwd) => {
  const mkdir$ = Observable.bindNodeCallback((...args) => client.mkdir(...args))(cwd)
    .catch(err => {
      if (err.errorCode === 102) return Observable.empty();
      throw err;
    })
    .ignoreElements();

  const events$ = createWatcher$(client, cwd).startWith({
    action: 'resync'
  });

  return Observable.merge(mkdir$, createResync$(client, cwd, events$));
};

export default createEtcd$;
