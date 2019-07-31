#!/usr/bin/env bash

docker-compose -f sanity/docker-compose.yml -f .circleci/docker-compose-ci.yml "$@"
