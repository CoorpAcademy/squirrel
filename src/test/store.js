import {Observable, Subject} from 'rxjs';
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

test('should return observable', t => {
  const node$ = Observable.empty();

  const {
    observable
  } = createStore(node$, identity);

  t.true(observable instanceof Observable);
});

test('should', t => {
  const node$ = Observable.of('foo', 'bar');

  const {
    store,
    observable
  } = createStore(node$, identity);

  return observable.toPromise().then(
    Promise.all([
      store('node').then(store =>
        t.deepEqual(store, 'bar')
      ),
      store('indexes').then(indexes =>
        t.deepEqual(indexes, 'bar')
      )
    ])
  );
});

