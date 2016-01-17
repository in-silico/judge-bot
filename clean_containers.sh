#!/bin/bash

# Usage: remove all exited containers
#
# ./clean_containers.sh container_id


docker rm `docker ps -aq` 2> /dev/null
