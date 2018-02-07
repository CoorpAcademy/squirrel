import createFetch$ from '../../etcd/fetch';
import createReducer$ from '../../store/reducer';
import createSaver$ from '../../fs/saver';

const save = (client, outDir) => {
  return createFetch$(client)
    .pipe(createReducer$)
    .pipe(createSaver$(outDir))
    .toPromise();
};

export default save;
