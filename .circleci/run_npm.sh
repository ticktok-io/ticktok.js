#!/usr/bin/env bash

docker run -v `pwd`:/opt/ci -w /opt/ci node:8-alpine npm "$@"