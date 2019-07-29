#!/usr/bin/env bash

export RABBIT_URI=amqp://rabbit
docker run --net=ci-network -v `pwd`:/opt/ci -w /opt/ci node:8-alpine npm "$@"
