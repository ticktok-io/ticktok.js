#!/usr/bin/env bash

docker run --net=ci-network --add-host=localhost:rabbit -v `pwd`:/opt/ci -w /opt/ci node:8-alpine npm "$@"
