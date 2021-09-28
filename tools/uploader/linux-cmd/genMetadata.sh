#!/bin/bash
function proc_exit()
{
    rm $TMPFILE $TMPFILE2 &>/dev/null
}

##### MAIN BODY #####
basedir=$(cd `dirname $0`;pwd)
datadir=$basedir/data
paperdir=$datadir/papers
metajson=$datadir/meta.json
finaldir=$basedir/final
finalparentdir=$(dirname $finaldir)
TMPFILE=$basedir/.tmp.$$
TMPFILE2=$basedir/.tmp.$$.2
ipfsurl=http://127.0.0.1:5001/api/v0
metafile=$finaldir/meta
sub_info_arry=()

trap 'proc_exit' EXIT

# Check file
if [ ! -d $datadir ]; then
    echo "ERROR: please create directory:data"
    exit 1
fi

if [ ! -d $paperdir ]; then
    echo "ERROR: please create papers directory in data"
    exit 1
fi

if [ ! -f $metajson ]; then
    echo "ERROR: please put meta.json file in data"
    exit 1
fi

# Check if valid meta file
if ! cat $metajson | jq . &>/dev/null; then
    echo "ERROR: invalid metajson:$metajson, right case is like:{\"file\": {\"title\" : \"tx\"},...}"
    exit 1
fi

# Create IPFS tmp directory
curl -X POST "$ipfsurl/object/new?arg=unixfs-dir" 1>$TMPFILE 2>/dev/null
if [ $? -ne 0 ]; then
    echo "ERROR: create new directory failed!"
    exit 1
fi
ipfsrootcid=$(cat $TMPFILE | jq -r '.Hash')

# Generate paper info
rm -rf $finaldir
mkdir -p $finaldir
find $paperdir -type f > $TMPFILE
while read path; do
    curl -s -X POST -F file=@$path "$ipfsurl/add" 1>$TMPFILE2
    if [ $? -ne 0 ]; then
        echo "ERROR: add file $path failed!"
    else
        filename=$(cat $TMPFILE2 | jq -r '.Name')
        cid=$(cat $TMPFILE2 | jq -r '.Hash')
        size=$(cat $TMPFILE2 | jq -r '.Size')
        info=""
        if cat $metajson | jq ".$filename" &>/dev/null; then
            info=$(cat $metajson | jq ".$filename")
            doi=$(echo $info | jq -r '.doi')
            fileinfo="{\"cid\":\"$cid\",\"size\":$size,\"filename\":\"$filename\",\"meta\":$info}"
            echo "$fileinfo" | jq . > $finaldir/$doi
            echo "INFO: add file:$path successfully!"
            curl -X POST "$ipfsurl/object/patch/add-link?arg=$ipfsrootcid&arg=$filename&arg=$cid" 1>$TMPFILE2 2>/dev/null
            if [ $? -ne 0 ]; then
                echo "WARN: add new file:$filename failed"
            else
                ipfsrootcid=$(cat $TMPFILE2 | jq -r '.Hash')
                sub_info_arry[${#sub_info_arry[*]}]="{\"cid\":\"$cid\",\"doi\":\"$doi\"}"
            fi
        fi
    fi
done < $TMPFILE

echo "INFO: IPFS root directory is $ipfsrootcid"
curl -X POST "$ipfsurl/object/stat?arg=$ipfsrootcid" 1>$TMPFILE 2>/dev/null
if [ $? -ne 0 ]; then
    echo "ERROR: get IPFS root:$ipfsrootcid info failed"
    exit 1
fi

# Get meta info
ipfs_root_size=$(cat $TMPFILE | jq -r '.CumulativeSize')
links=""
for cid in ${sub_info_arry[*]}; do
    links="${links}$cid,"
done
links="[${links:0:len-1}]"
echo "{\"cid\":\"$ipfsrootcid\",\"size\":$ipfs_root_size,\"links\":$links}" | jq . > $finaldir/meta

if [ -d "$finalparentdir/$ipfsrootcid" ]; then
    rm -rf $finalparentdir/$ipfsrootcid
fi
mv $finaldir $finalparentdir/$ipfsrootcid

# Pin add
curl -XPOST "$ipfsurl/pin/add?arg=$ipfsrootcid"
