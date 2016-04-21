import path from 'path';
import {
  compact,
  concat,
  filter,
  set as set_,
  startsWith
} from 'lodash/fp';

const get = (store, action) => {
  if (store.key === action.node.key) return store;
  return filter(node => startsWith(store.key, node.key), store.nodes)
  .reduce((acc, node) =>
    acc || get(node, action)
  , null);
};

const set = (store, {action, node, prevNode}) => {
  if (node.key === store.key) return node;

  const storeKey = path.join(
    store.key,
    path.relative(store.key, node.key).split('/').shift()
  );

  return set_(
    'nodes',
    concat(
      (store.nodes || []).filter(n => n.key !== node.key),
      set({
        key: storeKey,
        dir: true
      }, {
        action,
        node,
        prevNode
      })
    ),
    store
  );
};

const del = (store, {action, node, prevNode}) => {
  if (node.key === store.key) return null;

  if (store.dir && startsWith(store.key, node.key))
    return set_(
      'nodes',
      compact(
        store.nodes.map(child =>
          del(child, {action, node, prevNode})
        )
      ),
      store
    );

  return store;
};

export {
  get,
  set,
  del
};
