#!/bin/bash
function isValidCid()
{
    local tmpCid=$1
    local ret=0
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
maxSize=$((5 * 1024 * 1024 * 1024))
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
papers=($(printf '%s\n' "${files[@]}" | grep "$dirTag/$cidRoot/" | grep -v "$dirTag/$cidRoot/meta"))
papersNum=${#papers[*]}
if [ $papersNum -gt $maxNum ] || [ $papersNum -le 0 ]; then
    echo "Upload file number should range (0, $maxNum]"
    exit 1
fi

### Check meta
metaFile="$dirTag/$cidRoot/meta" 
if [ ! -f "$metaFile" ]; then
    echo "meta file not found"
    exit 1
fi
cidRootGet=$(cat $metaFile | $JQ -r .cid)
isValidCid $cidRootGet || { exit 1; }
totalSizeGet=$(cat $metaFile | $JQ -r .size)
countSize=0
declare -A doi2cid
subCids=($(cat $metaFile | jq -r '.links|.[]|.cid'))
index=0
## Check if cid is right
for doi in $(cat $metaFile | jq -r '.links|.[]|.doi'); do
    doiFile="$dirTag/$cidRoot/$doi"
    if [ ! -f "$doiFile" ]; then
        echo "doi file:$doiFile not found"
        exit 1
    fi
    cidGet=$(cat $doiFile | $JQ -r .cid)
    isValidCid $cidGet || { exit 1; }
    sizeGet=$(cat $doiFile | $JQ -r .size)
    if [ x"$cidGet" != x"${subCids[$index]}" ]; then
        echo "doi file:$doiFile cid:$cidGet not equal to meta sub-cid:${subCids[$index]}"
        exit 1
    fi
    ((index++))
    ((countSize += sizeGet))
done
## Check if size is right
if [ $totalSizeGet -le $countSize ]; then
    echo "file size:$totalSizeGet in meta should be greater than count size:$countSize"
    exit 1
fi
if [ $totalSizeGet -gt $maxSize ]; then
    echo "Total size:$totalSizeGet exceeds size limit:$maxSize"
    exit 1
fi
