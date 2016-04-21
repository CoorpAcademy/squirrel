import {set, del} from './patcher';

const createCombiner$ = event$ => {
  return event$.scan((store, action) => {
    if (!action || !action.action) return store;
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
