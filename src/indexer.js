import {
  assign,
  concat,
  get,
  map,
  pipe,
  reduce,
  zipObject
} from 'lodash/fp';

const updateIndexes = indexes => store => {
  return zipObject(indexes, map(function(index) {
    return buildIndex(index, store);
  }, indexes));
};

const buildIndex = (index, node) => {
  const value = get(index, node.value);

  return pipe(
    map(function(child) {
      return buildIndex(index, child);
    }),
    reduce(concat, []),
    reduce(assign, value ? zipObject([get(index, node.value)], [node]) : {})
  )(node.dir && node.nodes || []);
};

export default updateIndexes;
