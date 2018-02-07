import {pipe, get, map} from 'lodash/fp';

const tryParse = v => {
  try {
    return JSON.parse(v);
  } catch (err) {
    return v;
  }
};

export const parseKeyValue = kv => {
  if (kv.create_revision === '0')
    return {
      key: kv.key.toString('utf8')
    };
  return {
    key: kv.key.toString('utf8'),
    value: tryParse(kv.value.toString('utf8')),
    version: kv.mod_revision
  };
};

export const parseRangeResponse = pipe(get('kvs'), map(parseKeyValue));

export const createFetchCommand = rangeResponse => ({
  type: 'fetch',
  payload: parseRangeResponse(rangeResponse)
});

export const createWatchCommand = keyValueResponse => ({
  type: 'watch',
  payload: [parseKeyValue(keyValueResponse)]
});
