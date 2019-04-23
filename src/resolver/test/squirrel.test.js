/* eslint-disable ava/prefer-async-await */
import test from 'ava';
import squirrel, {fallbackPath} from '..';

test.beforeEach(function() {
  delete process.env.AWS_SECRET_ACCESS_KEY;
  delete process.env.AWS_ACCESS_KEY_ID;
});

test('fallbackPath should be 0 on master', t => {
  const theFallbackPath = fallbackPath();
  t.is(theFallbackPath, 'tmp/squirrel-0.json');
});

test('createResolver should fallback to legacy', t => {
  const resolver = squirrel();
  return resolver.getBrands().then(brands => {
    return t.deepEqual(brands, ['digital']);
  });
});
