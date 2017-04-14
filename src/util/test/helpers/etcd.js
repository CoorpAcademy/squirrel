import EventEmitter from 'events'; // eslint-disable-line fp/no-events
import {assign, mapValues, noop, pipe} from 'lodash/fp';

const createWatcher = () => () => {
  const watcher = new EventEmitter();
  watcher.stop = noop;
  return watcher;
};

const createEtcdMock = (mock, watcher = createWatcher(), abort = noop) =>
  pipe(
    mapValues(mocks => (...argz) => {
      let rets = mocks.shift();
      if (rets.assert) {
        rets.assert(...argz);
        rets = rets.values;
      }
      const cb = argz.pop();
      setTimeout(() => cb(...rets), 0);
      return {
        abort
      };
    }),
    assign({
      watcher
    })
  )(mock);

export default createEtcdMock;
