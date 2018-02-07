import {tmpdir} from 'os';
import {join} from 'path';
import {readFile} from 'fs';
import test from 'ava';
import {Observable} from 'rxjs';
import createSave from '../saver';
import fallback from './fixtures/fallback';

const readFile$ = Observable.bindNodeCallback(readFile);

test('should create file', async t => {
  const tmpPath = join(tmpdir(), `squirrel-test-${Date.now()}.json`);
  const save = createSave(tmpPath);

  const records$ = Observable.of({
    foo: {
      key: 'foo',
      value: 'foo',
      version: '1'
    },
    bar: {
      key: 'bar',
      value: 'bar',
      version: '2'
    }
  });

  await save(records$).toPromise();

  const actual = await readFile$(tmpPath, {encoding: 'UTF8'})
    .map(JSON.parse)
    .toPromise();
  const expected = {
    foo: {
      key: 'foo',
      value: 'foo',
      version: '1'
    },
    bar: {
      key: 'bar',
      value: 'bar',
      version: '2'
    }
  };

  t.deepEqual(actual, expected);
});

test('should do nothing if file is not defined', async t => {
  const save = createSave();

  const events = await save(Observable.of(fallback))
    .toArray()
    .toPromise();
  t.deepEqual(events, [fallback]);
});
