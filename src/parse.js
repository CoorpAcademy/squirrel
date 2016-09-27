import {get, set, reduce, has, pipe} from 'lodash/fp';

export const stringify = value => JSON.stringify(value, null, 2);

export const parseValue = value => {
  try {
    return JSON.parse(value);
  } catch (err) {
    return value;
  }
};

export const parseNode = pipe(
  node => { // Root node does't has 'key' key
    if (has('key', node)) return node;
    return set('key', '/', node);
  },
  node => { // Parse children of dir node
    if (!node.dir) return node;
    return set('nodes', (node.nodes || []).map(parseNode), node);
  },
  node => { // Parse value of file node
    if (!has('value', node)) return node;
    return set('value', parseValue(get('value', node)), node);
  }
);

export const parseAction = action => {
  return reduce((action, key) => {
    if (has(key, action)) {
      return set(key, parseNode(get(key, action)), action);
    }
    return action;
  }, action, ['node', 'prevNode']);
};
