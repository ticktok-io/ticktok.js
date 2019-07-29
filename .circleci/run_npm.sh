#!/usr/bin/env bash

docker run --network=ci-network -v `pwd`:/opt/ci -w /opt/ci node:8-alpine npm "$@"
