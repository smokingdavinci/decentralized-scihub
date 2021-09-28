# Linux paper uploader

## Steps

1. Follow this [link](https://docs.ipfs.io/install/ipfs-desktop/) to download and run ipfs in your device

1. Put data directory with genMetadata.sh. data directory structure is like:
    ```
    ├── data
    │   ├── meta.json
    │   └── papers
    │       ├── file1
    │       ├── file2
    │       └── file3
    ```
    **papers** diretory contains papers that you want to upload. 'meta.json' structure is like:
    ```
    {
        "file1" : {
            "title" : "t1",
            "doi" : "d1",
            "author" : ["a1","a2"],
            "pmid" : ""
        },
        "file2" : {
            "title" : "t1",
            "doi" : "d2",
            "author" : ["a1","a2"],
            "pmid" : ""
        },
        "file3" : {
            "title" : "t1",
            "doi" : "d3",
            "author" : ["a1","a2"],
            "pmid" : ""
        }
    }
    ```
1. When you have done, execute **genMetadata.sh** script. Then you can get a directory named with 'Qmxxx'
1. Copy this 'Qmxxx' directory to **<root_dir>/papers** directory
1. Commit a pull_request to [smokingdavinci/decentralized-scihub](https://github.com/smokingdavinci/decentralized-scihub) repo
1. Wait for CI complete, check the result which success means your papers has been uploaded in Crust network while error means something wrong with your pull_request
