import {EventEmitter} from 'events';
import emptyRoot from '../fixtures/empty-root';

const createEtcd = (options = {}) => {
  const getOptions = options.get || [];
  const watcherOptions = options.watcher || [];
  return {
    get: (cwd, options, cb) => cb(...(getOptions.shift() || [null, emptyRoot])),
    watcher: (cwd, idk, options) => {
      const eventEmitter = new EventEmitter();

      setTimeout(() => {
        watcherOptions.forEach(value => {
          eventEmitter.emit(value.action, value);
        });
      });

      return eventEmitter;
    }
  };
};

export default createEtcd;
