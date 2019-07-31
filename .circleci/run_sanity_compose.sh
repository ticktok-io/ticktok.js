#!/usr/bin/env bash

docker-compose --project-directory `pwd` -f sanity/docker-compose.yml -f .circleci/docker-compose-ci.yml "$@"
