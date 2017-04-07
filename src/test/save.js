import {tmpdir} from 'os';
import {join} from 'path';
import {readFile} from 'fs';
import test from 'ava';
import {Observable} from 'rxjs';
import createSave from '../save';
import fallback from './fixtures/fallback';

const readFile$ = Observable.bindNodeCallback(readFile);

test('should create file', async t => {
  const tmpPath = join(tmpdir(), `squirrel-test-${Date.now()}.json`);
  const save = createSave(tmpPath);

  const events = await save(Observable.of(fallback))
    .flatMap(() => readFile$(tmpPath, {encoding: 'UTF8'}).map(JSON.parse))
    .toArray()
    .toPromise();
  t.deepEqual(events, [fallback]);
});

test('should do nothing if file is not defined', async t => {
  const save = createSave();

  const events = await save(Observable.of(fallback)).toArray().toPromise();
  t.deepEqual(events, [fallback]);
});
