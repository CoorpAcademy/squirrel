import createWatcher$ from './watch';
import createResync$ from './resync';

const createEtcd$ = (client, watcher, cwd) => {
  const events$ = createWatcher$(watcher).startWith({
    action: 'resync'
  });

  return createResync$(client, cwd, events$);
};

export default createEtcd$;
