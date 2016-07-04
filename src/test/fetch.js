import test from 'ava';
import {pipe, fill, map, concat} from 'lodash/fp';

import createFetch$ from '../fetch';

import emptyRoot from './fixtures/empty-root';

test('should fetch nodes', t => {
  const getMocks = [[null, emptyRoot]];

  const client = {
    get: (cwd, options, cb) => cb(...getMocks.shift())
  };

  const fetch$ = createFetch$(client, '/');

  const expected = [emptyRoot];
  return new Promise((resolve, reject) => {
    fetch$.subscribe(
      node => {
        t.deepEqual(node, expected.shift());
      },
      reject,
      resolve
    );
  });
});

test('should retry on error', t => {
  const getMocks = pipe(
    fill(new Error),
    map(err => [err]),
    concat([[null, emptyRoot]])
  )(Array(10));

  const client = {
    get: (cwd, options, cb) => cb(...getMocks.shift())
  };

  const fetch$ = createFetch$(client, '/');

  return new Promise((resolve, reject) => {
    fetch$.subscribe(
      resolve,
      reject,
      reject
    );
  });
});
