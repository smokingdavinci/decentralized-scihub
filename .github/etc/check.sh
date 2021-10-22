#!/bin/bash
function isNumber()
{
    local tmpSize=$1
    if [ x"$tmpSize" = x"0" ]; then
        return 0
    fi

    if ! [[ $tmpSize =~ ^[1-9][0-9]*$ ]]; then
        echo "$tmpSize is not a valid number"
        return 1
    fi
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
maxSize=$((5 * 1024 * 1024 * 1024))
fileMaxSize=$((500 * 1024 * 1024))
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
metaFile="$dirTag/$cidRoot/meta" 
papers=($(printf '%s\n' "${files[@]}" | grep "$dirTag/$cidRoot/" | grep -v "$metaFile"))
papersNum=${#papers[*]}
if [ $papersNum -gt $maxNum ] || [ $papersNum -le 0 ]; then
    echo "Upload file number should range (0, $maxNum]"
    exit 1
fi

### Check meta
if [ ! -f "$metaFile" ]; then
    echo "meta file not found"
    exit 1
fi
cidRootGet=$(cat $metaFile | $JQ -r .cid)
isValidCid $cidRootGet || { exit 1; }
totalSizeGet=$(cat $metaFile | $JQ -r .size)
isNumber $totalSizeGet || { exit 1; }
countSize=0
subCids=($(cat $metaFile | jq -r '.links|.[]|.cid'))
subDois=($(cat $metaFile | jq -r '.links|.[]|.doi'))
if [ ${#subCids[@]} -ne ${#subDois[@]} ]; then
    echo "Meta file links cid and doi don't match"
    exit 1
fi
index=0
## Check if cid is right
for doi in ${subDois[@]}; do
    doi=${doi/\//\%}
    doiFile="$dirTag/$cidRoot/$doi"
    if [ ! -f "$doiFile" ]; then
        echo "doi file:$doiFile not found"
        exit 1
    fi
    cidGet=$(cat $doiFile | $JQ -r .cid)
    isValidCid $cidGet || { exit 1; }
    sizeGet=$(cat $doiFile | $JQ -r .size)
    isNumber $sizeGet || { exit 1; }
    if [ $sizeGet -gt $fileMaxSize ]; then
        echo "file:$(cat $doiFile | $JQ -r .path) size:$sizeGet is greater than file size limit:$fileMaxSize"
        exit 1
    fi
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
