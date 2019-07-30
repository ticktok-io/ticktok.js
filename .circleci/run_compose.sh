#!/usr/bin/env bash

docker-compose --project-directory `pwd` -f docker-compose.yml -f `dirname "$0"`/docker-compose-ci.yml "$@"
