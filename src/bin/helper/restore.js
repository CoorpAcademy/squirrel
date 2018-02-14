import {unescape as qsUnescape} from 'querystring';
import {join} from 'path';
import {readFile, readdir} from 'fs';
import mkdirp from 'mkdirp';
import {Observable} from 'rxjs';
import promisify from './promisify';

const mkdirpP = promisify(mkdirp);
const readFileP = promisify(readFile);
const readdirP = promisify(readdir);

const restore = async (client, inDir) => {
  await mkdirpP(inDir);

  return Observable.fromPromise(readdirP(inDir))
    .concatMap(Observable.from)
    .mergeMap(file =>
      Observable.fromPromise(
        readFileP(join(inDir, file), {
          encoding: 'utf8'
        })
      )
        .map(JSON.parse)
        .map(content => [qsUnescape(file), content])
    )
    .mergeMap(([key, value]) =>
      Observable.fromPromise(client.put(key).value(JSON.stringify(value, null, 4)))
    )
    .toPromise();
};

export default restore;
