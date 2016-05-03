import {set, del} from './patcher';
import createDebug from 'debug';
const debug = createDebug('squirrel:combiner');

const createCombiner$ = event$ => {
  return event$.scan((store, action) => {
    if (!action || !action.action) return store;
    debug(`scan: ${action.action}`);
    if (action.action === 'get')
      return action.node;
    if (action.action === 'set')
      return set(store, action);
    if (action.action === 'delete')
      return del(store, action);
    return store;
  }, {
    dir: true,
    nodes: []
  });
};

export default createCombiner$;
