import {set, reduce, has} from 'lodash/fp';

const parseNode = node => {
  if (!has('key', node))
    node = set('key', '/', node);
  if (node.dir)
    return set('nodes', (node.nodes || []).map(parseNode), node);
  try {
    return set('value', JSON.parse(node.value), node);
  } catch (err) {
    return node;
  }
};

const parseAction = action => {
  return reduce((action, key) => {
    if (has(key, action)) {
      return set(key, parseNode(action[key]), action);
    }
    return action;
  }, action, ['node', 'prevNode']);
};

export {
  parseNode,
  parseAction
};
