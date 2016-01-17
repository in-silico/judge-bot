#!/bin/bash

#
#
# ./judge.sh tl ml container_id execution_commands


tl=$1
shift

ml=$1
shift

container_id=$1
shift

execution=$@

commands=$(cat << EOF
  time="0"
  memory="0"
  verdict=""

  out=\$( { /usr/bin/time -f '\n%e %M' $execution; } 2>&1 )
  status=\$?

  out=(\$(echo -e "\$out" | tail -n1));
  time=\${out[0]}
  memory=\${out[1]}
  time_exceeded=\$(/usr/bin/python -c "print \$time >= $tl")
  memory_exceeded=\$(/usr/bin/python -c "print \$memory >= $ml * 1000")

  if [ "\$time_exceeded" == "True" ]; then
    verdict="TIME_LIMIT_EXCEEDED"
  elif [ "\$memory_exceeded" == "True" ]; then
    verdict="MEMORY_LIMIT_EXCEEDED"
  elif [ "\$status" -ne "0" ]; then
    verdict="RUNTIME_ERROR"
  else
    diff=\$(diff -wB main.out ans.out)
    if [ "\$?" -eq "0" ]; then
      verdict="OK"
    else
      verdict="WRONG_ANSWER"
    fi
  fi

  echo -e "{
  \"time\" : "\"\$time\s\"",
  \"memory\" : "\"\$memory\K\B\"",
  \"exit_code\" : \"\$status\",
  \"verdict\" : \"\$verdict\"\n}"

EOF
)


running=$(docker inspect --format="{{ .State.Running }}" "$container_id" 2> /dev/null)
if [ "$running" != "true" ]; then
  echo "Error: container '$container_id' is not running"
  exit 1
fi

output=$(timeout $tl docker exec "$container_id" bash -c "$commands" || true)

if [ "$output" == "" ]; then
  memory=$(cat /sys/fs/cgroup/memory/docker/$container_id/memory.usage_in_bytes)
  memory_KB=$(echo "$memory  / 1000" | bc)

  echo -e "{
  \"time\" : \""$tl"s\",
  \"memory\" : \""$memory_KB"KB\",
  \"exit_code\" : \"0\",
  \"verdict\" : \"TIME_LIMIT_EXCEEDED\"\n}"
else
  echo -e $output
fi
