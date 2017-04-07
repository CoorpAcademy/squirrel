import createDebug from 'debug';
import {set, del} from './patch';

const debug = createDebug('squirrel:combine');

const createCombiner$ = event$ => {
  return event$.scan(
    (store, action) => {
      if (!action || !action.action) return store;
      debug(`scan: ${action.action}`);
      if (action.action === 'get') return action.node;
      if (action.action === 'set') return set(store, action);
      if (action.action === 'delete') return del(store, action);
      return store;
    },
    {
      dir: true,
      nodes: []
    }
  );
};

export default createCombiner$;
