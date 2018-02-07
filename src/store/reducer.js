import {reduce, unset, set} from 'lodash/fp';

const eventReducer = (state, event) => {
  if (event.value === undefined) return unset(event.key, state);
  else return set(event.key, event, state);
};

const createReducer$ = command$ =>
  command$
    .filter(command => !!command && typeof command.type === 'string')
    .scan((records, command) => {
      switch (command.type) {
        case 'fetch':
          return reduce(eventReducer, {}, command.payload);
        case 'watch':
          return reduce(eventReducer, records, command.payload);
        default:
          return records;
      }
    }, {});

export default createReducer$;
