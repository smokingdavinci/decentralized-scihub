#!/bin/bash
basedir=$(cd `dirname $0`;pwd)
metatag="meta"
JQ=$basedir/jq
if [ ! -f "$JQ" ]; then
    exit 1
fi
for file in $(git status -s | awk '$1 ~/AM?/ {print $2}'); do
    filename=$(basename $file)
    if [ x"$filename" = x"$metatag" ]; then
        cat $file | $JQ -r .cid 2>/dev/null
        if [ $? -eq 0 ]; then
            exit 0
        fi
    fi
done
