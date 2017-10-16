import {EventEmitter} from 'events'; // eslint-disable-line fp/no-events
import test from 'ava';
import createEtcd$ from '../etcd';
import createEtcdMock from '../util/test/helpers/etcd';
import setEvent from './fixtures/set-event';
import deleteEvent from './fixtures/delete-event';
import resyncEvent from './fixtures/resync-event';

test('should composite events observable', async t => {
  const getMocks = [
    [
      null,
      {
        action: 'get',
        node: {
          key: '/',
          dir: true,
          nodes: [setEvent.node]
        }
      }
    ],
    [
      null,
      {
        action: 'get',
        node: {
          key: '/',
          dir: true,
          nodes: []
        }
      }
    ]
  ];

  const watcher = new EventEmitter();
  watcher.stop = () => {};

  const client = createEtcdMock(
    {
      get: getMocks
    },
    () => watcher
  );

  const events$ = createEtcd$(client, '/');

  const expected = [
    {
      action: 'get',
      node: {
        key: '/',
        dir: true,
        nodes: [setEvent.node]
      }
    },
    setEvent,
    deleteEvent,
    {
      action: 'get',
      node: {
        key: '/',
        dir: true,
        nodes: []
      }
    },
    deleteEvent,
    setEvent
  ];

  const eventsP = events$
    .take(6)
    .toArray()
    .toPromise();

  [setEvent, deleteEvent, resyncEvent, deleteEvent, setEvent].forEach(event =>
    watcher.emit(event.action, event)
  );

  const events = await eventsP;
  t.deepEqual(events, expected);
});
