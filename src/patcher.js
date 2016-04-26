import path from 'path';
import {
  compact,
  concat,
  filter,
  set as set_,
  startsWith
} from 'lodash/fp';
import createDebug from 'debug';
const debug = createDebug('squirrel:patcher');

const get = (store, {action, node}) => {
  if (store.key === node.key) {
    debug(`get: ${node.key}`);
    return store;
  }

  return filter(node => startsWith(store.key, node.key), store.nodes)
  .reduce((acc, _node) =>
    acc || get(_node, {action, node})
  , null);
};

const set = (store, {action, node, prevNode}) => {
  if (node.key === store.key) {
    debug(`set: ${node.key}`);
    return node;
  }

  const storeKey = path.join(
    store.key,
    path.relative(store.key, node.key).split('/').shift()
  );

  return set_(
    'nodes',
    concat(
      (store.nodes).filter(n => n.key !== node.key),
      set({
        key: storeKey,
        dir: true,
        nodes: []
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
  if (node.key === store.key) {
    debug(`del: ${node.key}`);
    return null;
  }

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
