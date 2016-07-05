import {EventEmitter} from 'events';
import test from 'ava';

import createWatcher$ from '../watch';

import setEvent from './fixtures/set-event';
import deleteEvent from './fixtures/delete-event';
import resyncEvent from './fixtures/resync-event';

test('should create watcher observable', t => {
  t.plan(2);

  const watcher = new EventEmitter();
  watcher.stop = () => {};

  const client = {
    watcher: cwd => {
      t.deepEqual(cwd, '/');
      return watcher;
    }
  };

  const watcher$ = createWatcher$(client, '/');

  const assertion = watcher$.first().toPromise().then(event => {
    t.deepEqual(event, setEvent);
  });

  watcher.emit(setEvent.action, setEvent);

  return assertion;
});

test('should close watcher on unsubscribe', t => {
  t.plan(1);

  const watcher = new EventEmitter();
  watcher.stop = () => {
    t.pass();
  };

  const client = {
    watcher: () => watcher
  };

  const watcher$ = createWatcher$(client, '/');

  watcher$.subscribe().unsubscribe();
});

test('should, emit set/delete/resync events', t => {
  t.plan(1);

  const watcher = new EventEmitter();
  watcher.stop = () => {};

  const client = {
    watcher: () => watcher
  };

  const watcher$ = createWatcher$(client, '/');

  const expected = [setEvent, deleteEvent, resyncEvent];

  const assertion = watcher$.take(3).toArray().toPromise().then(events => {
    t.deepEqual(events, expected);
  });

  expected.forEach(event =>
    watcher.emit(event.action, event)
  );

  return assertion;
});
