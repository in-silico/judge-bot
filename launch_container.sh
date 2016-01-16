#!/bin/bash

# Usage: launch a container and keep it running, return id of container
#
#   -m : memory limit in Megabytes
#   -w : work directory inside the container (absolute path)
#   -v : bind mount a volume host_dir:container_dir (absolute path)
#
# ./launch_container.sh -m 250m -w /tmp/run -v `pwd`/run1:/tmp/run


docker run $@ -ti -d debian-testing bash
