#!/bin/bash

testDir="$1"
curDir="$(readlink -f "$(dirname "$BASH_SOURCE")")"
nameTest="testing C++"
source="hello-world.cpp"
command="/usr/bin/g++ ./$source && ./a.out"

source "$curDir/run-in-container.sh" "$nameTest" "$testDir" "$source" "$command"
