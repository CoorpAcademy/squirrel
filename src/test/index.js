import test from 'ava';
import createSquirrel from '..';

test('should createClient', t => {
  const squirrel = createSquirrel();
  t.truthy(squirrel);
  squirrel.close();
});

test('should accept fallback', t => {
  const squirrel = createSquirrel({
    namespace: 'brands/',
    save: false
  });
  t.truthy(squirrel);
  squirrel.close();
});
