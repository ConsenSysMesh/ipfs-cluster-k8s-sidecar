var worker = require('./lib/worker');

console.log('Starting up ipfs-cluster-k8s-sidecar');

worker.init(function(err) {
  if (err) {
    console.error('Error trying to initialize ipfs-cluster-k8s-sidecar', err);
    return;
  }

  worker.workloop();
});
