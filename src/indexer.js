import {
  assign,
  flatMap,
  get,
  map,
  pipe,
  reduce,
  zipObject
} from 'lodash/fp';
import createDebug from 'debug';
const debug = createDebug('squirrel:indexer');

const updateIndexes = indexes => store => {
  debug(`Update indexes ${indexes.join(',')}`);
  return zipObject(indexes, map(function(index) {
    return buildIndex(index, store);
  }, indexes));
};

const buildIndex = (index, node) => {
  const value = get(index, node.value);

  return pipe(
    flatMap(function(child) {
      return buildIndex(index, child);
    }),
    reduce(assign, value ? zipObject([get(index, node.value)], [node]) : {})
  )(node.dir && node.nodes || []);
};

export default updateIndexes;
