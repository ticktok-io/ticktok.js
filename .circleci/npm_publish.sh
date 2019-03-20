#!/usr/bin/env bash


if [[ "${CIRCLE_BRANCH}" == "master" && -z "${CIRCLE_TAG}"]]; then
    npm publish
else
    echo Nothin to publish
fi
