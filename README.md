# IPFS-Cluster Kubernetes Replica Set Sidecar

This project is as a PoC to setup a ipfs-cluster replica set or statefulset using Kubernetes. It should handle resizing of any type and be
resilient to the various conditions both ipfs-cluster and kubernetes can find themselves in.

This project was inspired by and references https://github.com/cvallance/mongo-k8s-sidecar

## How to use it

The docker image is hosted on docker hub and can be found here:
https://hub.docker.com/r/joshorig/ipfs-cluster-k8s-sidecar/

An example kubernetes statefulset can be found in the examples directory on github here:
https://github.com/ConsenSys/ipfs-cluster-k8s-sidecar

There you will also find some helper scripts to test out creating the replica set and resizing it.

### Settings

| Environment Variable | Required | Default | Description |
| --- | --- | --- | --- |
| KUBE_NAMESPACE | NO |  | The namespace to look up pods in. Not setting it will search for pods in all namespaces. |
| IPFSCLUSTER_SIDECAR_POD_LABELS | YES |  | This should be a be a comma separated list of key values the same as the podTemplate labels. See above for example. |
| IPFSCLUSTER_SIDECAR_SLEEP_SECONDS | NO | 5 | This is how long to sleep between work cycles. |
| IPFSCLUSTER_SIDECAR_UNHEALTHY_SECONDS | NO | 15 | This is how many seconds a replica set member has to get healthy before automatically being removed from the replica set. |
| IPFSCLUSTER_PORT | NO | 9094 | Configures the ipfs-cluster port, allows the usage of non-standard ports. |


## Still to do

- Add SSL support
- Add tests!
- Add to travisCI
- Alter k8s call so that we don't have to filter in memory
