import {Observable, Subject, Subscription} from 'rxjs';
import test from 'ava';
import createStore from '..';

test('should get records and indexes', async t => {
  const records$ = new Subject();

  const {store, subscription} = createStore(records$, ['value']);

  const assert = Promise.all([
    store('records').then(records =>
      t.deepEqual(records, {
        foo: {
          key: 'foo',
          value: {value: 'foo'},
          version: '1'
        }
      })
    ),
    store('indexes').then(indexes =>
      t.deepEqual(indexes, {
        value: {
          foo: {
            key: 'foo',
            value: {value: 'foo'},
            version: '1'
          }
        }
      })
    )
  ]);

  records$.next({
    foo: {
      key: 'foo',
      value: {value: 'foo'},
      version: '1'
    }
  });

  await assert;
  subscription.unsubscribe();
});

test('should wait first event', t => {
  const records$ = new Subject();

  const {store} = createStore(records$, []);

  return t.throws(Promise.race([store('records'), Promise.reject(new Error())]));
});

test('should return subscription', t => {
  const records$ = Observable.empty();

  const {subscription} = createStore(records$, []);

  t.true(subscription instanceof Subscription);
});

// test('should', async t => {
//   const records$ = Observable.of(
//     {
//       foo: {
//         key: 'foo',
//         value: 'foo',
//         version: '1'
//       }
//     },
//     {
//       bar: {
//         key: 'bar',
//         value: 'bar',
//         version: '1'
//       }
//     }
//   );

//   const {store, subscription} = createStore(records$, []);

//   const [records, indexes] = await Promise.all([store('records'), store('indexes')]);
//   t.deepEqual(
//     records,
//     new Map([
//       [
//         'foo',
//         {
//           key: 'foo',
//           value: 'foo',
//           version: '1'
//         }
//       ],
//       [
//         'bar',
//         {
//           key: 'bar',
//           value: 'bar',
//           version: '1'
//         }
//       ]
//     ])
//   );
//   t.deepEqual(indexes, new Map());

//   subscription.unsubscribe();
// });
