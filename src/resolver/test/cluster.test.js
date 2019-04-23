import test from 'ava';
import * as clusterLib from '../cluster';

test('workerId should be 0 on master', t => {
  const id = clusterLib.workerId();
  t.is(id, 0);
});
test('workerId should be 2 on worker', t => {
  clusterLib.cluster.isWorker = true;
  clusterLib.cluster.worker = {id: 2};
  const id = clusterLib.workerId();
  t.is(id, 2);
  clusterLib.cluster.isWorker = false;
});
test('workerId should be set by env on worker', t => {
  clusterLib.cluster.isWorker = true;
  process.env.WORKER_ID = 3;
  const id = clusterLib.workerId();
  delete process.env.WORKER_ID;
  t.is(id, '3');
  clusterLib.cluster.isWorker = false;
});
