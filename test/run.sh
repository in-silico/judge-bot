#!/bin/bash

echo ""
for D in tests/*; do
  if [ -d $D ]; then
    testDir=$D
    pushd $testDir &> /dev/null

    echo "running ... "$testDir
    ./$tesDir/run.sh

    popd &> /dev/null
  fi
done

