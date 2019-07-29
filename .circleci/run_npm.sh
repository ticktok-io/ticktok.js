#!/usr/bin/env bash

docker run --network=repo_default -v `pwd`:/opt/ci -w /opt/ci node:8-alpine npm "$@"
