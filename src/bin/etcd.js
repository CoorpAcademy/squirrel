import {readFileSync} from 'fs';
import {resolve} from 'path';
import {pick} from 'lodash/fp';
import Etcd from 'node-etcd';

const makeEtcdClient = argz => {
  const hosts = argz.hosts || 'http://localhost:2379';

  const etcdOptions = !argz.ca ? {} : {ca: readFileSync(resolve(process.cwd(), argz.ca))};

  const client = new Etcd(hosts.split(','), pick(['ca'], etcdOptions));

  return client;
};

export default makeEtcdClient;
