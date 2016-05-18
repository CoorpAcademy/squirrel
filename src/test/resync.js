import test from 'ava';
import {Observable} from 'rxjs';

import createEtcd from './helpers/etcd';
import createResyncer$ from '../resync';

import setEvent from './fixtures/set-event';
import resyncEvent from './fixtures/resync-event';

test('should transform resync event', async t => {
  const client = createEtcd({
    get: [[null, {
      action: 'get',
      node: {
        key: '/',
        dir: true,
        nodes: [setEvent.node]
      }
    }]]
  });

  const events$ = Observable.of(resyncEvent);

  const watcher$ = createResyncer$(client, '/', events$);

  const expected = [{
    action: 'get',
    node: {
      key: '/',
      dir: true,
      nodes: [setEvent.node]
    }
  }];

  const events = await watcher$.take(1).toArray().toPromise();
  t.deepEqual(events, expected);
});

test('should keep order', async t => {
  const client = createEtcd({
    get: [[null, {
      action: 'get',
      node: {
        key: '/',
        dir: true,
        nodes: [setEvent.node]
      }
    }]]
  });

  const events$ = Observable.of(setEvent, resyncEvent, setEvent);

  const watcher$ = createResyncer$(client, '/', events$);

  const expected = [setEvent, {
    action: 'get',
    node: {
      key: '/',
      dir: true,
      nodes: [setEvent.node]
    }
  }, setEvent];

  const events = await watcher$.take(3).toArray().toPromise();
  t.deepEqual(events, expected);
});