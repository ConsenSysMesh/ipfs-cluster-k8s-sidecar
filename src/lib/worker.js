var ipfsclusterAPI = require('./ipfs-cluster');
var k8s = require('./k8s');
var config = require('./config');
var ip = require('ip');
var moment = require('moment');
var dns = require('dns');
var os = require('os');
var util = require('util');
Promise.allNamed = require("./sequentialPromiseNamed.js");

var loopSleepSeconds = config.loopSleepSeconds;
var unhealthySeconds = config.unhealthySeconds;

var hostIp = false;
var hostIpAndPort = false;

var init = function(done) {
  //Borrowed from here: http://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
  var hostName = os.hostname();
  dns.lookup(hostName, function (err, addr) {
    if (err) {
      return done(err);
    }

    hostIp = addr;
    hostIpAndPort = hostIp + ':' + config.ipfsClusterPort;
    console.log("host and port:"+hostIpAndPort)
    done();
  });
};

var workloop = function workloop() {
  if (!hostIp || !hostIpAndPort) {
    throw new Error('Must initialize with the host machine\'s addr');
  }

  Promise.allNamed({
      clusterNodeDetails: () => ipfsclusterAPI.getId(),
      pods: () => k8s.getIPFSClusterPods(),
      peers: () => ipfsclusterAPI.getPeers()
  })
  .then(info => {

    if(!info.clusterNodeDetails || !info.pods || !info.peers)
    {
      return finish('Error getting details');
    }

    console.log("Connected to cluster node: "+info.clusterNodeDetails.id+" at IP: "+config.podIP)
    //console.log(info)
    //Lets remove any pods that aren't running or haven't been assigned an IP address yet
    for (var i = info.pods.length - 1; i >= 0; i--) {
      var pod = info.pods[i];
      if (pod.status.phase !== 'Running' || !pod.status.podIP || pod.status.podIP === config.podIP) {
        info.pods.splice(i, 1);
      }
    }

    var peerCheckResults = checkPeers(info.peers,info.pods);
    console.log(peerCheckResults)

    Promise.all(peerCheckResults.peersToAdd.map(
      peerToAdd => ipfsclusterAPI.getId(peerToAdd)
    ))
    .then(peersToAddDetails => {
      Promise.all(peersToAddDetails.map(
        peerToAdd => {
          console.log("Adding peer: "+peerToAdd.addresses[1])
          ipfsclusterAPI.addPeer(peerToAdd.addresses[1])
        }
      ))
      .then(results => {
        Promise.all(peerCheckResults.peersToRemove.map(
          peerToRemove => {
            console.log("Removing peer: "+peerToRemove.id)
            ipfsclusterAPI.removePeer(peerToRemove.id)
          }
        ))
        .then(results => {
          finish(null)
        })
      })
    })


  })
};

var checkPeers = function(peers,pods) {
  var peersToAdd = [];
  var peersToRemove = [];

  pods.map(pod => {
    var found = false
    peers.map(peer => {
      if(peer.addresses.length > 0)
      {
        if(peer.addresses[1].indexOf(pod.status.podIP) > -1)
        {
          found = true
        }
      }
    })
    if(!found)
    {
      peersToAdd.push(pod.status.podIP)
    }
  })

  peers.map(peer => {
    var found = false
    pods.map(pod => {
      if(peer.addresses.length > 0)
      {
        if(peer.addresses[1].indexOf(pod.status.podIP) > -1 || pod.status.podIP === config.podIP)
        {
          found = true
        }
      }
    })
    if(!found)
    {
      peersToRemove.push(peer.addresses[1])
    }
  })

  return { peersToAdd: peersToAdd, peersToRemove: peersToRemove }
}

var finish = function(err) {
  if (err) {
    console.error('Error in workloop', err);
  }
  setTimeout(workloop, loopSleepSeconds * 1000);
};



module.exports = {
  init: init,
  workloop: workloop
};
