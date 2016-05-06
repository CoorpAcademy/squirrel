import {EventEmitter} from 'events';
import test from 'ava';

import createWatcher$ from '../watch';

import setEvent from './fixtures/set-event';
import deleteEvent from './fixtures/delete-event';
import resyncEvent from './fixtures/resync-event';

test('should watch node mutations', t => {
  const watcher = new EventEmitter();
  const watcher$ = createWatcher$(watcher, '/');
  const expected = [setEvent, deleteEvent, resyncEvent];

  const assertion = watcher$.take(3).toArray().toPromise().then(events => {
    t.deepEqual(events, expected);
  });

  expected.forEach(event =>
    watcher.emit(event.action, event)
  );

  return assertion;
});
