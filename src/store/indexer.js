import {get, reduce, set, values} from 'lodash/fp';

const buildIndex = records => indexName => {
  return reduce(
    (index, record) => {
      const key = get(indexName, record.value);
      return set([key], record, index);
    },
    {},
    records
  );
};

const createIndexer = indexNames => store => {
  const records = values(store);

  return reduce(
    (indexes, indexName) => {
      return set([indexName], buildIndex(records)(indexName), indexes);
    },
    {},
    indexNames
  );
};

export default createIndexer;
