#!/usr/bin/env bash

docker run -e RABBIT_URI=amqp://rabbit --net=ci-network -v `pwd`:/opt/ci -w /opt/ci node:8-alpine npm "$@"
