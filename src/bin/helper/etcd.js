import {Etcd3} from '@coorpacademy/etcd3';

const createEtcd = ({
  hosts,
  username,
  password,
  rootCertificate,

  namespace = ''
} = {}) => {
  const auth =
    !!username || !!password
      ? {
          username,
          password
        }
      : null;

  const credentials = rootCertificate
    ? {
        rootCertificate: Buffer.from(rootCertificate)
      }
    : null;

  const client = new Etcd3({
    hosts: (hosts || 'http://127.0.0.1:2379').split(','),
    auth,
    credentials
  });

  return client;
};

export default createEtcd;
