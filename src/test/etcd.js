import {EventEmitter} from 'events'; // eslint-disable-line fp/no-events
import {before} from 'lodash/fp';
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
  const mkdirMocks = [[null, true]];

  const watcher = new EventEmitter();

  const emitEvents = before(
    () =>
      [setEvent, deleteEvent, resyncEvent, deleteEvent, setEvent].forEach(event =>
        watcher.emit(event.action, event)
      ),
    3
  );
  watcher.addListener = function(event, listener) {
    const detach = EventEmitter.prototype.addListener.call(this, event, listener);
    setTimeout(emitEvents, 0);
    return detach;
  };
  watcher.stop = () => {};

  const client = createEtcdMock(
    {
      get: getMocks,
      mkdir: mkdirMocks
    },
    () => watcher
  );

  const events$ = createEtcd$(client, '/');

  const eventsP = events$
    .take(6)
    .toArray()
    .toPromise();

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

  const events = await eventsP;
  t.deepEqual(events, expected);
});

test('should ignore if cwd already exists', async t => {
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
    ]
  ];
  const NotAFile = new Error('Not a file');
  NotAFile.errorCode = 102;

  const mkdirMocks = [[NotAFile, null]];

  const client = createEtcdMock({
    get: getMocks,
    mkdir: mkdirMocks
  });

  const events$ = createEtcd$(client, '/');

  const eventsP = events$
    .take(1)
    .toArray()
    .toPromise();

  const expected = [
    {
      action: 'get',
      node: {
        key: '/',
        dir: true,
        nodes: [setEvent.node]
      }
    }
  ];

  const events = await eventsP;
  t.deepEqual(events, expected);
});

test('should throw error if error occured', t => {
  const UnknownError = new Error();
  const mkdirMocks = [[UnknownError, null]];

  const client = createEtcdMock({
    mkdir: mkdirMocks
  });

  const events$ = createEtcd$(client, '/');

  const eventsP = events$.toPromise();

  return t.throws(eventsP);
});
