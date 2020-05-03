#!/bin/bash

rm -rf ../bin/cli
tsc --outDir ../bin/cli

for ITEM in package.json
do
    echo "cp $ITEM ../bin/cli/$ITEM"
    cp -f $ITEM ../bin/cli/$ITEM
done
