import test from 'ava';
import {join} from 'path';
import {parseNode} from '../parse';

import createFallback$ from '../fallback';

import expected from './fixtures/fallback';

test('should load fallback', async t => {
  const events = await createFallback$(
    join(__dirname, 'fixtures/fallback.json')
  ).toArray().toPromise();
  t.deepEqual(events, [{
    action: 'get',
    node: parseNode(expected)
  }]);
});

test('shouldn\'t throw error if file doesn\'t exist', async t => {
  const events = await createFallback$(
    join(__dirname, 'fixtures/nope.json')
  ).toArray().toPromise();
  t.deepEqual(events, []);
});
