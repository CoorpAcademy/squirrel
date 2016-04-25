import test from 'ava';
import {join} from 'path';

import createFallback$ from '../fallback';

import expected from './fixtures/fallback';

test('should load fallback', t => {
  return createFallback$(
    join(__dirname, 'fixtures/fallback.json')
  ).toArray().toPromise().then(events =>
    t.deepEqual(events, [{
      action: 'get',
      node: expected
    }])
  );
});