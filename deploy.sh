#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
docker-compose -f "${DIR}/docker-compose.yml" pull bot
docker-compose -f "${DIR}/docker-compose.yml" up -d bot

