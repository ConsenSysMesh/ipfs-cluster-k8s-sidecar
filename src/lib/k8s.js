const K8s = require('k8s');
var config = require('./config');


fs = require('fs');

const readToken = fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token');

var kubeapi = K8s.api({
    endpoint: config.k8sROServiceAddress,
    version: '/api/v1',
    auth: {
      "token": readToken
    },
    strictSSL: false
})

var getIPFSClusterPods = async function() {
  var apiURL = 'pods'
  if(config.namespace)
  {
    apiURL = 'namespaces/'+config.namespace+'/pods'
  }

  var podItems = [];

  try {
    const podResult = await kubeapi.get(apiURL)
    podItems = await podResult.items
  }
  catch(err)
  {
    console.log(err)
  }

  var pods = [];
  for (var j in podItems) {
    pods = pods.concat(podItems[j])
  }

  var labels = config.ipfsClusterPodLabelCollection;
  var results = [];
  for (var i in pods) {
    var pod = pods[i];
    if (podContainsLabels(pod, labels)) {
      results.push(pod);
    }
  }

  return results;
}

var podContainsLabels = function podContainsLabels(pod, labels) {
  if (!pod.metadata || !pod.metadata.labels) return false;

  for (var i in labels) {
    var kvp = labels[i];
    if (!pod.metadata.labels[kvp.key] || pod.metadata.labels[kvp.key] != kvp.value) {
      return false;
    }
  }

  return true;
};

module.exports = {
  getIPFSClusterPods: getIPFSClusterPods
};
