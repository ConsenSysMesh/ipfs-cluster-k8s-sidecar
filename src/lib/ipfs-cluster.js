const superagent = require('superagent');
var config = require('./config');

var localhost = '127.0.0.1'; //Can access ipfscluster as localhost from a sidecar

var getId = async function(host) {
  if (arguments.length === 0) {
      host = localhost;
  }
  var id = null;
  try {
    const apiURL = 'http://'+host+':'+config.ipfsClusterPort+'/id'
    const response = await superagent.get(apiURL)
    id = await response.body;
  }
  catch(err) {
    console.log(err)
  }
  return id

}

var getPeers = async function(host) {
  if (arguments.length === 0) {
      host = localhost;
  }

  var peers = null;
  try {
    const apiURL = 'http://'+host+':'+config.ipfsClusterPort+'/peers'
    const response = await superagent.get(apiURL)
    peers = await response.body;
  }
  catch(err) {
    console.log(err)
  }
  return peers

}

var addPeer = async function(host,peerAddress) {
  if (arguments.length === 1) {
    peerAddress = host;
    host = localhost;
  }

  var result = null

  try {
    const apiURL = 'http://'+host+':'+config.ipfsClusterPort+'/peers'
    const response = await superagent.post(apiURL).send({ peer_multiaddress: peerAddress })
    result = await response.body;
  }
  catch(err) {
    console.log(err)
  }
  return result

}

var removePeer = async function(host,peerId) {
  if (arguments.length === 1) {
    peerId = host;
    host = localhost;
  }

  var result = null

  try {
    const apiURL = 'http://'+host+':'+config.ipfsClusterPort+'/peers/'+peerId
    const response = await superagent.del(apiURL)
    result = await response.body;
  }
  catch(err) {
    console.log(err)
  }
  return result

}

module.exports = {
  getId: getId,
  getPeers: getPeers,
  addPeer: addPeer,
  removePeer: removePeer
};
