import {tmpdir} from 'os';
import {join} from 'path';
import {readFile} from 'fs';
import test from 'ava';
import {Observable} from 'rxjs';
import createSave from '../save';

import fallback from './fixtures/fallback';

const readFile$ = Observable.bindNodeCallback(readFile);

test('should create file', t => {
  const tmpPath = join(tmpdir(), `squirrel-test-${Date.now()}.json`);
  const save = createSave(tmpPath);

  return save(
    Observable.of(fallback)
  ).flatMap(() =>
    readFile$(
      tmpPath,
      {encoding: 'UTF8'}
    ).map(JSON.parse)
  ).toArray().toPromise().then(events => {
    t.deepEqual(events, [fallback]);
  });
});

test('should do nothing if file is not defined', t => {
  const save = createSave();

  return save(
    Observable.of(fallback)
  ).toArray().toPromise().then(events => {
    t.deepEqual(events, [fallback]);
  });
});
