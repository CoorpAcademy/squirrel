import test from 'ava';
import {Observable} from 'rxjs';
import createReducer$ from '../reducer';

test('should fetch nodes', async t => {
  const events$ = Observable.of(
    {type: 'foo'},
    {
      type: 'fetch',
      payload: [
        {
          key: 'foo',
          value: 'foo'
        }
      ]
    },
    {
      type: 'watch',
      payload: [
        {
          key: 'bar',
          value: 'bar'
        }
      ]
    }
  );

  const records$ = createReducer$(events$);

  const expected = [
    {},
    {
      foo: {
        key: 'foo',
        value: 'foo'
      }
    },
    {
      foo: {
        key: 'foo',
        value: 'foo'
      },
      bar: {
        key: 'bar',
        value: 'bar'
      }
    }
  ];
  const actual = await records$.toArray().toPromise();

  t.deepEqual(actual, expected);
});

test('should remove node', async t => {
  const events$ = Observable.of(
    {},
    {
      type: 'fetch',
      payload: [
        {
          key: 'foo',
          value: 'foo'
        }
      ]
    },
    {
      type: 'watch',
      payload: [
        {
          key: 'foo'
        }
      ]
    }
  );

  const node$ = createReducer$(events$);

  const expected = [
    {
      foo: {
        key: 'foo',
        value: 'foo'
      }
    },
    {}
  ];
  const actual = await node$.toArray().toPromise();

  t.deepEqual(actual, expected);
});

test('should prevent malformed actions', async t => {
  const events$ = Observable.of(
    {},
    {
      type: 'fetch',
      payload: [
        {
          key: 'foo',
          value: 'foo'
        }
      ]
    },
    {},
    null,
    undefined,
    [],
    {foo: 'foo'}
  );

  const node$ = createReducer$(events$);

  const expected = [
    {
      foo: {
        key: 'foo',
        value: 'foo'
      }
    }
  ];
  const actual = await node$.toArray().toPromise();

  t.deepEqual(actual, expected);
});
