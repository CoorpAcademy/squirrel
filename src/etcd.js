import createWatcher$ from './watch';
import createResync$ from './resync';

const createEtcd$ = (client, cwd) => {
  const events$ = createWatcher$(client, cwd).startWith({
    action: 'resync'
  });

  return createResync$(client, cwd, events$);
};

export default createEtcd$;
