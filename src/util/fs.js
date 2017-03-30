import {stat, readdir, readFile} from 'fs';
import {join} from 'path';
import {curry} from 'lodash/fp';
import {Observable} from 'rxjs';

export const stat$ = Observable.bindNodeCallback(stat);

const _readdir$ = Observable.bindNodeCallback(readdir);
export const readdir$ = pathFS =>
  _readdir$(pathFS).flatMap(Observable.from).map(entry => join(pathFS, entry));

export const readFile$ = Observable.bindNodeCallback(readFile);
export const readFileUTF8$ = file => readFile$(file, {encoding: 'UTF8'});

export const isFile$ = pathFS => stat$(pathFS).map(_stat => _stat.isFile());

export const isDirectory$ = pathFS => stat$(pathFS).map(_stat => _stat.isDirectory());

export const filter$ = curry((predicate, value) =>
  predicate(value).filter(Boolean).map(() => value));
