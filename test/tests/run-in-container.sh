#!/bin/bash

baseImage="../../../debian"
imageTag="test-container"
nameTest="$1"
testDir="$2"
source="$3"
command="$4"
tmpDir="$(mktemp -t -d docker-library-test-XXXXXXXXXX)"
trap "rm -rf '$tmpDir'" EXIT

cp -rf $baseImage/Dockerfile $tmpDir
cp -rf $testDir/$source $tmpDir
cp -rf $testDir/expected-stdout.txt $tmpDir

echo "COPY $source /" >> $tmpDir/Dockerfile
docker build -t "$imageTag" "$tmpDir" &> /dev/null

if [ $? -ne 0 ]; then
  echo -e "Error while building image: $imageTag\n"
  exit 1
fi

trap "docker rmi -f '$imageTag' &> /dev/null" EXIT
docker run --rm "$imageTag" sh -c "$command" > $tmpDir/output.txt

result="failed"
diff -wB expected-stdout.txt $tmpDir/output.txt &> /dev/null

if [ $? -eq 0 ]; then
  result="passed"
fi

echo "[$nameTest] - "$result
echo ""
