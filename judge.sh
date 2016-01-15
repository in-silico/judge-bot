#!/bin/bash

sub_id="1"
compilation="/usr/bin/g++ -o2 -static -pipe -o source source.cpp"
execution="./source < main.in > main.out"
host_dir="`pwd`""/run"$sub_id
container_dir="/tmp/run"$sub_id
time="/usr/bin/time -f '\n%e %M'"

max_run_time="10"
max_comp_time="10"
tl="3.5"
ml="250"

commands=$(cat << EOF
  $compilation 2> /dev/null;
  status=\$?

  time="0"
  memory="0"
  verdict=""

  if [ "\$status" -eq "0" ]; then
    out=\$( { $time timeout $tl $execution; } 2>&1 )
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
  else
    verdict="COMPILATION_ERROR"
  fi

  echo -e "{
  \"time\" : "\"\$time\s\"",
  \"memory\" : "\"\$memory\K\B\"",
  \"exit_code\" : \"\$status\",
  \"verdict\" : \"\$verdict\"\n}"

EOF
)


container_id=$(docker run -m "$ml"m -w $container_dir -d -v $host_dir:$container_dir debian-testing bash -c "eval $commands")
exit_code=$(timeout "$max_run_time" docker wait "$container_id" || true)
running=$(docker inspect --format="{{ .State.Running }}" "$container_id" 2> /dev/null)

if [ "$running" == "true" ]; then
  docker kill $cid &> /dev/null

  echo -e "{
  \"time\" : "\"$tl\s\"",
  \"memory\" : \"0KB\",
  \"exit_code\" : \"-1\",
  \"verdict\" : \"TIME_LIMIT_EXCEEDED\"\n}"
else
  docker logs $container_id
fi

docker rm -f $container_id &> /dev/null
