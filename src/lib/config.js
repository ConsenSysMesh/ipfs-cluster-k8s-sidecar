var dns = require('dns');

var getIPFSClusterPodLabels = function() {
  return process.env.IPFSCLUSTER_SIDECAR_POD_LABELS || false;
};

var getIPFSClusterPodLabelCollection = function() {
  var podLabels = getIPFSClusterPodLabels();
  if (!podLabels) {
    return false;
  }
  var labels = process.env.IPFSCLUSTER_SIDECAR_POD_LABELS.split(',');
  for (var i in labels) {
    var keyAndValue = labels[i].split('=');
    labels[i] = {
      key: keyAndValue[0],
      value: keyAndValue[1]
    };
  }

  return labels;
};

var getk8sROServiceAddress = function() {
  return "https://" + process.env.KUBERNETES_SERVICE_HOST + ":" + process.env.KUBERNETES_SERVICE_PORT
};

/**
 * @returns k8sClusterDomain should the name of the kubernetes domain where the cluster is running.
 * Can be convigured via the environmental variable 'KUBERNETES_CLUSTER_DOMAIN'.
 */
var getK8sClusterDomain = function() {
  var domain = process.env.KUBERNETES_CLUSTER_DOMAIN || "cluster.local";
  verifyCorrectnessOfDomain(domain);
  return domain;
};

/**
 * Calls a reverse DNS lookup to ensure that the given custom domain name matches the actual one.
 * Raises a console warning if that is not the case.
 * @param clusterDomain the domain to verify.
 */
var verifyCorrectnessOfDomain = function(clusterDomain) {
  if (!clusterDomain) {
    return;
  }

  var servers = dns.getServers();
  if (!servers || !servers.length) {
    console.log("dns.getServers() didn't return any results when verifying the cluster domain '%s'.", clusterDomain);
    return;
  }

  // In the case that we can resolve the DNS servers, we get the first and try to retrieve its host.
  dns.reverse(servers[0], function(err, host) {
    if (err) {
      console.warn("Error occurred trying to verify the cluster domain '%s'",  clusterDomain);
    }
    else if (host.length < 1 || !host[0].endsWith(clusterDomain)) {
      console.warn("Possibly wrong cluster domain name! Detected '%s' but expected similar to '%s'",  clusterDomain, host);
    }
    else {
      console.log("The cluster domain '%s' was successfully verified.", clusterDomain);
    }
  });
};

/**
 * @returns k8sMongoServiceName should be the name of the (headless) k8s service operating the mongo pods.
 */
var getK8sIPFSClusterServiceName = function() {
  return process.env.KUBERNETES_IPFSCLUSTER_SERVICE_NAME || false;
};

/**
 * @returns ipfsClusterPort this is the port on which the ipfscluster instances run. Default is 9094.
 */
var getIPFSClusterPort = function() {
  var ipfsClusterPort = process.env.IPFSCLUSTER_PORT || 9094;
  console.log("Using ipfscluster port: %s", ipfsClusterPort);
  return ipfsClusterPort;
};


/**
 * @returns boolean
 */
var stringToBool = function(boolStr) {
  var isTrue = ( boolStr === 'true' ) || false;

  return isTrue;
};

module.exports = {
  namespace: process.env.KUBE_NAMESPACE,
  loopSleepSeconds: process.env.IPFSCLUSTER_SIDECAR_SLEEP_SECONDS || 5,
  unhealthySeconds: process.env.IPFSCLUSTER_SIDECAR_UNHEALTHY_SECONDS || 15,
  podIP: process.env.POD_IP,
  env: process.env.NODE_ENV || 'local',
  ipfsClusterPodLabels: getIPFSClusterPodLabels(),
  ipfsClusterPodLabelCollection: getIPFSClusterPodLabelCollection(),
  k8sROServiceAddress: getk8sROServiceAddress(),
  k8sIPFSClusterServiceName: getK8sIPFSClusterServiceName(),
  k8sClusterDomain: getK8sClusterDomain(),
  ipfsClusterPort: getIPFSClusterPort()
};
