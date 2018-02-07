import {join} from 'path';
import test from 'ava';
import createRestorer$ from '../restorer';

const SAVE_FILE = join(__dirname, 'fixtures/fallback.json');

test('should load save', async t => {
  const actual = await createRestorer$(SAVE_FILE)
    .toArray()
    .toPromise();

  const expected = [
    {
      type: 'fetch',
      payload: [
        {
          key: 'foo',
          value: 'foo',
          version: '1'
        },
        {
          key: 'bar',
          value: 'bar',
          version: '2'
        }
      ]
    }
  ];

  t.deepEqual(actual, expected);
});

test("shouldn't throw error if file doesn't exist", async t => {
  const actual = await createRestorer$(join(__dirname, 'fixtures/nope.json'))
    .toArray()
    .toPromise();

  const expected = [];

  t.deepEqual(actual, expected);
});

test("shouldn't throw error if file doesn't exist and fallback is rejected", async t => {
  const actual = await createRestorer$(
    join(__dirname, 'fixtures/nope.json'),
    Promise.reject(new Error())
  )
    .toArray()
    .toPromise();

  const expected = [];

  t.deepEqual(actual, expected);
});

test("should load preloadedStore if fallback doesn't exist", async t => {
  const actual = await createRestorer$(
    join(__dirname, 'fixtures/nope.json'),
    Promise.resolve({
      foo: {
        key: 'foo',
        value: 'foo',
        version: '1'
      },
      bar: {
        key: 'bar',
        value: 'bar',
        version: '2'
      }
    })
  )
    .toArray()
    .toPromise();

  const expected = [
    {
      type: 'fetch',
      payload: [
        {
          key: 'foo',
          value: 'foo',
          version: '1'
        },
        {
          key: 'bar',
          value: 'bar',
          version: '2'
        }
      ]
    }
  ];

  t.deepEqual(actual, expected);
});
