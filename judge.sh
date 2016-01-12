#!/bin/bash

sub_id="1"
compilation="/usr/bin/g++ -o2 -static -pipe -o source source.cpp"
execution="./source < main.in > main.out"
host_dir="`pwd`""/run"$sub_id
container_dir="/tmp/run"$sub_id
commands="cd $container_dir && $compilation && $execution"

max_run_time="10"
max_comp_time="10"
tl="6"
ml="250"

container_id=$(docker run -d -v $host_dir:$container_dir debian-testing sh -c "$commands")
exit_code=$(timeout "$max_run_time" docker wait "$container_id" || true)
running=$(docker inspect --format="{{ .State.Running }}" "$container_id" 2> /dev/null)

if [ "$running" == "true" ]; then
  docker kill $cid &> /dev/null
  echo "Time limit exceeded"
fi

docker rm -f $container_id &> /dev/null
