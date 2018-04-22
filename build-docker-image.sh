#!/bin/bash

if [[ "$1" =~ [0-9]\.[0-9]\.[0-9] ]]; then
  TAG=$1
  echo "Building with tag: ${TAG}"
else
  echo "Please supply tag"
  exit 1
fi

docker build -t joshorig/ipfs-cluster-k8s-sidecar:${TAG} -f Dockerfile .
docker build -t joshorig/ipfs-cluster-k8s-sidecar:latest -f Dockerfile .
