import test from 'ava';
import {join} from 'path';
import {tmpdir} from 'os';
import createClient from '../index';

test('should createClient', t => {
  const client = createClient();
  t.truthy(client);

  client.close();
});

test('should accept fallback', t => {
  const client = createClient({
    save: false
  });

  t.truthy(client);
});
