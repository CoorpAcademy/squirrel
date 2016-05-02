import test from 'ava';

import createEtcd from './helpers/etcd';
import {createEtcd$} from '../etcd';

import setEvent from './fixtures/set-event';
import deleteEvent from './fixtures/delete-event';
import resyncEvent from './fixtures/resync-event';

test('should resync', async t => {
  const client = createEtcd({
    get: [[null, {
      action: 'get',
      node: {
        key: '/',
        dir: true,
        nodes: [setEvent.node]
      }
    }]],
    watcher: [setEvent, deleteEvent, resyncEvent, deleteEvent, setEvent]
  });
  const watcher$ = createEtcd$(client, client.watcher(), '/');

  const expected = [{
      action: 'get',
      node: {
        key: '/',
        dir: true,
        nodes: [setEvent.node]
      }
    }, setEvent, deleteEvent, {
    action: 'get',
    node: {
      key: '/',
      dir: true,
      nodes: []
    }
  }, deleteEvent, setEvent];

  const events = await watcher$.take(6).toArray().toPromise();
  t.deepEqual(events, expected);
});
