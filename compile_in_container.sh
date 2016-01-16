#!/bin/bash

# Usage: Compile source code inside container
#
# ./compile_in_container.sh container_id compilation_commands

container_id=$1
shift

docker exec $container_id $@
