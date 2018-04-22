FROM node:alpine
MAINTAINER Joshua Cassidy <joshua.cassidy@consensys.net>

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

WORKDIR /opt/joshorig/ipfs-cluster-k8s-sidecar

COPY package.json /opt/joshorig/ipfs-cluster-k8s-sidecar/package.json

RUN npm install

COPY ./src /opt/joshorig/ipfs-cluster-k8s-sidecar/src
COPY .foreverignore /opt/joshorig/.foreverignore

CMD ["npm", "start"]
