import {join, relative} from 'path';
import {Observable} from 'rxjs';
import {includes, get, filter} from 'lodash/fp';
import {isDirectory$, readdir$, readFileUTF8$} from './fs';
import {get$, set$, delRecursive$, del$, mkdir$, rmdirRecursive$} from './etcd';
import makeDebug from 'debug';
const debug = makeDebug('squirrel:util:cli');

export const sync$ = (client, pathFS, pathETCD) => {
  debug('sync', pathFS, pathETCD);
  return isDirectory$(pathFS).flatMap(isDirectory => {
    if (isDirectory)
      return syncDirectory$(client, pathFS, pathETCD);
    return syncFile$(client, pathFS, pathETCD);
  }).flatMap(entry =>
    sync$(client, join(pathFS, entry), join(pathETCD, entry))
  );
};

export const syncDirectory$ = (client, pathFS, pathETCD) => {
  debug('syncDirectory', pathFS, pathETCD);
  return get$(client, pathETCD).catch(err => {
    if (err.errorCode === 100)
      return mkdir$(client, pathETCD);
    throw err;
  }).flatMap(action => {
    if (action && !get('node.dir', action))
      return del$(client, pathETCD)
        .flatMap(() => mkdir$(client, pathETCD));
    return Observable.of(action);
  }).flatMap(({node}) => {
    const {nodes} = node;

    const entries = readdir$(pathFS);

    return entries.toArray().flatMap(entries => {
      const nodeToDelete = filter(node => {
        return !includes(join(pathFS, relative(pathETCD, node.key)), entries);
      }, nodes);
      const nodeToDelete$ = Observable.from(nodeToDelete).flatMap(node =>
        delRecursive$(client, node.key)
      );
      return nodeToDelete$;
    }).toArray().flatMap(() => entries);
  }).map(entry => relative(pathFS, entry));
};

export const syncFile$ = (client, pathFS, pathETCD) => {
  debug('syncFile', pathFS, pathETCD);
  const entry$ = readFileUTF8$(pathFS);

  return get$(client, pathETCD).catch(err => {
    if (err.errorCode === 100)
      return Observable.of(null);
    throw err;
  }).flatMap(action => {
    if (action && get('node.dir', action)) return rmdirRecursive$(client, pathETCD);
    return Observable.of(action);
  }).combineLatest(entry$, (action, file) => {
    if (action && get('node.value', action) === file) return Observable.empty();
    return set$(client, pathETCD, file);
  }).combineAll().ignoreElements();
};
