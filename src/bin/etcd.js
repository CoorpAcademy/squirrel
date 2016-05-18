import {readFileSync} from 'fs';
import {resolve} from 'path';
import {assign, pick, pipe, set} from 'lodash/fp';
import Etcd from 'node-etcd';

export default argz => {
  const hosts = argz.hosts || 'http://localhost:2379';

  const etcdOptions = pipe(
    assign(
      argz.ca ?
        set('ca', readFileSync(resolve(process.cwd(), argz.ca)), {}) :
        {}
    )
  )({});

  const client = new Etcd(
    hosts.split(','),
    pick(['ca'], etcdOptions)
  );

  return client;
};
