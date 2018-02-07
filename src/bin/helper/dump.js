import {promisify} from 'util';
import {escape as qsEscape} from 'querystring';
import {join} from 'path';
import {writeFile} from 'fs';
import {Observable} from 'rxjs';
import mkdirp from 'mkdirp';
import {parseRangeResponse} from '../../etcd/command';

const mkdirpP = promisify(mkdirp);
const writeFileP = promisify(writeFile);

const dump = async (client, outDir) => {
  await mkdirpP(outDir);

  return Observable.fromPromise(client.getAll().exec())
    .map(parseRangeResponse)
    .concatMap(Observable.from)
    .mergeMap(record =>
      Observable.fromPromise(
        writeFileP(join(outDir, qsEscape(record.key)), JSON.stringify(record.value, null, 2), {
          encoding: 'utf8'
        })
      )
    )
    .toPromise();
};

export default dump;
