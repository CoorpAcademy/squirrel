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
