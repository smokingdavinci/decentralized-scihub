#!/bin/bash
function isValidDoi()
{
    local tmpDoi=$1
    if [ x"$tmpDoi" != x"" ] && [[ $tmpDoi =~ 10.[0-9]{4,9}/[-._\;()/:a-z0-9A-Z]+ ]]; then
        return 0
    fi

    echo "Invalid doi:$tmpDoi"
    return 1
}

function isValidCid()
{
    local tmpCid=$1
    local ret=0
    if [ x"$tmpCid" = x"" ]; then
        echo "cid cannot be empty"
        return 1
    fi

    if ! [[ $tmpCid =~ ^Qm ]]; then
        ret=1
    fi
    if [ ${#tmpCid} -ne $cidLength ]; then
        ret=1
    fi

    if [ $ret -ne 0 ]; then
        echo "Invalid cid:$tmpCid(Not start with 'Qm' or length not $cidLength)"
    fi

    return $ret
}

########## MAIN BODY ##########
basedir=$(cd `dirname $0`;pwd)
files=($1)
cidLength=46
maxNum=100
dirTag="papers"
cidTag='(?<=papers/).*(?=/)'
JQ=$basedir/jq

if [ ! -f "$JQ" ]; then 
    exit 1
fi

### Check if there is only one meta file
cidArry=($(printf '%s\n' "${files[@]}" | grep -Po $cidTag | sort | uniq))
if [ ${#cidArry[*]} -ne 1 ]; then
    echo "Can just upload one Qmxxx folder, but there are ${#cidArry[*]}"
    exit 1
fi
cidRoot=${cidArry[0]}
isValidCid $cidRoot || { exit 1; }

### Check if paper number is valid
metaFile=$dirTag/$cidRoot/meta
papers=($(printf '%s\n' "${files[@]}" | grep "$dirTag/$cidRoot/" | grep -v "$metaFile"))
papersNum=${#papers[*]}
if [ $papersNum -gt $maxNum ] || [ $papersNum -le 0 ]; then
    echo "Upload file number should range (0, $maxNum]"
    exit 1
fi

### Check if doi is valid
if [ ! -f $metaFile ]; then
    echo "Meta file not found!"
    exit 1
fi
declare -A doi2cid
for line in $(cat $metaFile | $JQ -c '.links|.[]'); do
    doi=$(echo $line | $JQ -r .doi)
    isValidDoi $doi || { exit 1; }
    cid=$(echo $line | $JQ -r .cid)
    isValidCid $cid || { exit 1; }
    doi2cid[$doi]=$cid
done
if [ ${#doi2cid[@]} -ne ${#papers[@]} ]; then
    echo "Meta file links doi and papers number don't match"
    exit 1
fi
for file in ${papers[@]}; do
    doi=$(basename $file)
    doi=${doi/\%/\/}
    isValidDoi $doi || { exit 1; }
    cid=$(cat $file | $JQ -r .cid)
    isValidCid $cid || { exit 1; }
    subCid=${doi2cid[$doi]}
    if [ x"$subCid" = x"" ]; then
        echo "Cannot find cid with doi:'$doi' in meta file"
        exit 1
    fi
    if [ x"$cid" != x"$subCid" ]; then
        echo "cid:'$cid' in file($doi) and meta links cid:'$subCid' don't match"
        exit 1
    fi
done
