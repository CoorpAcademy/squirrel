import {Observable, Subject, Subscription} from 'rxjs';
import test from 'ava';
import {identity} from 'lodash/fp';

import createStore from '../store';

test('should get node and indexes', t => {
  const node$ = new Subject();

  const {
    store
  } = createStore(node$, identity);

  const assert = Promise.all([
    store('node').then(store =>
      t.deepEqual(store, 'foo')
    ),
    store('indexes').then(indexes =>
      t.deepEqual(indexes, 'foo')
    )
  ]);

  node$.next('foo');

  return assert;
});

test('should wait first event', t => {
  const node$ = new Subject();

  const {
    store
  } = createStore(node$, identity);

  t.throws(Promise.race([
    store('node'),
    Promise.reject(new Error())
  ]));
});

test('should return subscription', t => {
  const node$ = Observable.empty();

  const {
    subscription
  } = createStore(node$, identity);

  t.true(subscription instanceof Subscription);
});

test('should', t => {
  const node$ = Observable.of('foo', 'bar');

  const {
    store,
    subscription
  } = createStore(node$, identity);

  return Promise.all([
    store('node').then(store =>
      t.deepEqual(store, 'bar')
    ),
    store('indexes').then(indexes =>
      t.deepEqual(indexes, 'bar')
    )
  ]).then(() => subscription.unsubscribe());
});

