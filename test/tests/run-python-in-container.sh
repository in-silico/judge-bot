#!/bin/bash

testDir="$1"
curDir="$(readlink -f "$(dirname "$BASH_SOURCE")")"
nameTest="testing Python"
source="hello-world.py"
command="/usr/bin/python ./$source"

source "$curDir/run-in-container.sh" "$nameTest" "$testDir" "$source" "$command"
