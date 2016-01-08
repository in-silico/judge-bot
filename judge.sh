#!/bin/bash


SUB_ID="1"
COMPILATION="/usr/bin/g++ -o2 -static -pipe -o source source.cpp"
EXECUTION="./source < main.in > main.out"
DIR_DATA="`pwd`""/run"$SUB_ID
DIR_RUN="/tmp/run"$SUB_ID
COMMANDS="cd $DIR_RUN && $COMPILATION && $EXECUTION"

docker run -v $DIR_DATA:$DIR_RUN debian-testing sh -c "$COMMANDS"

