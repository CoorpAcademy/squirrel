import cluster from 'cluster';

// check if is master or is worker aka process in cluster
function isWorker() {
  return cluster.isWorker;
}

// get worker id or 0 if not applicable
function workerId() {
  if (!isWorker()) {
    return 0;
  }
  // WORKER_ID support for recluster
  // prefered over cluster.worker.id that will increment after restart
  return process.env.WORKER_ID || cluster.worker.id;
}

export {isWorker, workerId, cluster};
