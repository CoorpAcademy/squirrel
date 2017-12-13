import {join} from 'path';
import test from 'ava';
import {parseNode} from '../parse';
import createFallback$ from '../fallback';
import expected from './fixtures/fallback';
import expectedAPI from './fixtures/api';

test('should load fallback', async t => {
  const events = await createFallback$(join(__dirname, 'fixtures/fallback.json'), expectedAPI)
    .toArray()
    .toPromise();
  t.deepEqual(events, [
    {
      action: 'get',
      node: parseNode(expected)
    }
  ]);
});

test("shouldn't throw error if file doesn't exist", async t => {
  const events = await createFallback$(join(__dirname, 'fixtures/nope.json'))
    .toArray()
    .toPromise();
  t.deepEqual(events, []);
});

test("should load preloadedStore if fallback doesn't exists", async t => {
  const events = await createFallback$(join(__dirname, 'fixtures/nope.json'), expectedAPI)
    .toArray()
    .toPromise();

  t.deepEqual(events, [expectedAPI]);
});
