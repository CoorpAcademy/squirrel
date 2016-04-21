import {set, reduce, has} from 'lodash/fp';
import {Observable} from 'rxjs';

const parseNode = node => {
  if (node.dir)
    return set('nodes', (node.nodes || []).map(parseNode), node);
  try {
    return set('value', JSON.parse(node.value), node);
  } catch (err) {
    return node;
  }
};

const parseAction = action => {
  return reduce((action, key) => {
    if (has(key, action)) {
      return set(key, parseNode(action[key]), action);
    }
    return action;
  }, action, ['node', 'prevNode']);
};

const createFetch$ = (client, cwd) => {
  const list = Observable.bindNodeCallback(
    cb => client.get(cwd, {recursive: true}, (err, data) => cb(err, data))
  );

  return Observable.of(1)
    .flatMap(() => list())
    .retry(Infinity)
    .map(parseAction);
};

const createWatcher$ = watcher => {
  const set$ = Observable.fromEvent(watcher, 'set');
  const delete$ = Observable.fromEvent(watcher, 'delete');
  const reSync$ = Observable.fromEvent(watcher, 'resync');

  return Observable.merge(set$, delete$, reSync$)
    .map(parseAction);
};

const createEtcd$ = (client, watcher, cwd) => {
  const watcher$ = createWatcher$(watcher);

  const events$ = watcher$.startWith({
    action: 'resync'
  }).flatMap(action => {
    if (action.action === 'resync')
      return createFetch$(client, cwd);
    return Observable.of(action);
  });

  return events$;
};

export {
  createFetch$,
  createWatcher$,
  createEtcd$
};
