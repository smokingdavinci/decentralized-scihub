#!/bin/bash
basedir=$(cd `dirname $0`;pwd)
files=($1)
metatag="meta"
dirtag="papers"
JQ=$basedir/jq
if [ ! -f "$JQ" ]; then
    exit 1
fi
for file in ${files[@]}; do
    dir=${file%%\/*}
    if [ x"$dir" = x"$dirtag" ]; then
        filename=$(basename $file)
        if [ x"$filename" = x"$metatag" ]; then
            cat $file | $JQ -r .cid 2>/dev/null
            if [ $? -eq 0 ]; then
                exit 0
            fi
        fi
    fi
done
