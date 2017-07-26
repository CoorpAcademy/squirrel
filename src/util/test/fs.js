import {join} from 'path';
import {xor, map, isBuffer} from 'lodash/fp';
import test from 'ava';
import {isFile$, readdir$, isDirectory$, filter$, readFile$, readFileUTF8$} from '../fs';

const joinTestFolder = (...argz) => join(__dirname, 'fixtures/fs', ...argz);
const mapJoinTestFolder = map(joinTestFolder);

test('should return true if entry is a file', t =>
  isFile$(joinTestFolder('foo')).toPromise().then(isFile => t.deepEqual(isFile, true)));

test('should return false if entry is a directory', t =>
  isFile$(joinTestFolder('bar')).toPromise().then(isFile => t.deepEqual(isFile, false)));

test('should return error if entry is neither a file nor a directory', t => {
  return Promise.all([
    isFile$(joinTestFolder('qux')).toPromise().then(() => t.fail(), () => t.pass()),
    isFile$(joinTestFolder('qux/quux')).toPromise().then(() => t.fail(), () => t.pass()),
    isDirectory$(joinTestFolder('qux')).toPromise().then(() => t.fail(), () => t.pass()),
    isDirectory$(joinTestFolder('qux/quux')).toPromise().then(() => t.fail(), () => t.pass())
  ]);
});

test('should return false if entry is a file', t =>
  isDirectory$(joinTestFolder('foo'))
    .toPromise()
    .then(isDirectory => t.deepEqual(isDirectory, false)));

test('should return true if entry is a directory', t =>
  isDirectory$(joinTestFolder('bar'))
    .toPromise()
    .then(isDirectory => t.deepEqual(isDirectory, true)));

test('should read directory content', t =>
  readdir$(joinTestFolder())
    .toArray()
    .toPromise()
    .then(content => t.deepEqual(xor(content, mapJoinTestFolder(['foo', 'bar'])), [])));

test('should return error if entry is not a directory', t =>
  Promise.all([
    readdir$(joinTestFolder('foo')).toPromise().then(() => t.fail(), () => t.pass()),
    readdir$(joinTestFolder('quz')).toPromise().then(() => t.fail(), () => t.pass())
  ]));

test('should filterFile directory content', t =>
  readdir$(joinTestFolder())
    .flatMap(filter$(isFile$))
    .toArray()
    .toPromise()
    .then(files => t.deepEqual(files, mapJoinTestFolder(['foo']))));

test('should filterDirectory directory content', t =>
  readdir$(joinTestFolder())
    .flatMap(filter$(isDirectory$))
    .toArray()
    .toPromise()
    .then(directories => t.deepEqual(directories, mapJoinTestFolder(['bar']))));

test('should read file', async t => {
  const data = await readFile$(joinTestFolder('foo')).toPromise();
  t.true(isBuffer(data));
  t.deepEqual(data.toString(), 'foo');
});

test('should read UTF8 file', async t => {
  const data = await readFileUTF8$(joinTestFolder('foo')).toPromise();
  t.falsy(isBuffer(data));
  t.deepEqual(data, 'foo');
});
