'use strict';

const expect = require('chai').expect;
const clusterLib = require('../../lib/squirrel/cluster');

describe('cluster', function() {
  it('workerId should be 0 on master', function() {
    const id = clusterLib.workerId();
    expect(id).to.equal(0);
  });
  it('workerId should be 2 on worker', function() {
    clusterLib.cluster.isWorker = true;
    clusterLib.cluster.worker = {id: 2};
    const id = clusterLib.workerId();
    expect(id).to.equal(2);
    clusterLib.cluster.isWorker = false;
  });
  it('workerId should be set by env on worker', function() {
    clusterLib.cluster.isWorker = true;
    process.env.WORKER_ID = 3;
    const id = clusterLib.workerId();
    delete process.env.WORKER_ID;
    expect(id).to.equal('3');
    clusterLib.cluster.isWorker = false;
  });
});
