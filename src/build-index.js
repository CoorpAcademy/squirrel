import {
  assign,
  cond,
  constant,
  flatMap,
  get,
  getOr,
  map,
  pipe,
  reduce,
  zipObject
} from 'lodash/fp';
import createDebug from 'debug';

const debug = createDebug('squirrel:indexer');

const buildIndex = (index, node) => {
  const value = get(index, node.value);

  return pipe(
    cond([
        [get('dir'), getOr([], 'nodes')],
        [constant(true), constant([])]
    ]),
    flatMap(function(child) {
      return buildIndex(index, child);
    }),
    reduce(assign, value ? zipObject([get(index, node.value)], [node]) : {})
  )(node);
};

const updateIndexes = indexes => store => {
  debug(`Update indexes ${indexes.join(',')}`);
  return zipObject(indexes, map(function(index) {
    return buildIndex(index, store);
  }, indexes));
};

export default updateIndexes;
