#!/bin/bash

#
#
# ./judge.sh tl ml max_run_time container_id execution_commands
tl=$1
shift

ml=$1
shift

max_run_time=$1
shift

container_id=$1
shift

execution=$@

echo "tl: "$tl
echo "ml: "$ml
echo "max_run_time: "$max_run_time
echo "execution: "$execution

commands=$(cat << EOF
  time="0"
  memory="0"
  verdict=""

  out=\$( { /usr/bin/time -f '\n%e %M' timeout $tl $execution; } 2>&1 )
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

echo $commands

verdict_json=$(docker exec "$container_id" bash -c "eval $commands")
running=$(docker inspect --format="{{ .State.Running }}" "$container_id" 2> /dev/null)
exit_code=$(docker inspect --format="{{ .State.ExitCode }}" "$container_id" 2> /dev/null)

echo "output_json: "$verdict_json
#echo "exit_code: "$exit_code
#echo "running: "$running

if [ "$running" == "false" ]; then
#  docker kill $container_id &> /dev/null

  echo -e "{
  \"time\" : "\"$tl\s\"",
  \"memory\" : \"0KB\",
  \"exit_code\" : \"$exit_code\",
  \"verdict\" : \"TIME_LIMIT_EXCEEDED\"\n}"
else
  docker logs $container_id
fi

#docker rm -f $container_id &> /dev/null
