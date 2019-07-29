#!/usr/bin/env bash

docker-compose --project-directory `pwd` -f docker-compose.yml -f .circleci/docker-compose-ci.yml "$@"
