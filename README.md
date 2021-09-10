# To decentralized host knowledge

## The goal

To build an unstoppable SCIHub, We could migrate all the papers into IPFS and capture the index, then develop a mirror page that retrieves all the papers from IPFS. It's very hard to download 80+TB of data and pinning them by one person. It will be very helpful if we could have a co-work with all the paper maintainers.

The goal could be split into the following steps, which require the cooperation of the torrent maintainers and the developers.

### Steps for the torrent maintainers

1. Unzip the papers, pack those docs into several folders, ensure that the size of each folder is about 5GB;

2. Download and install IPFS;

3. Run a script in each folder, it will:
  a. store the folders in IPFS and generate IPFS CIDs for the folder and each paper.
  
  b. generate an index file for the papers in each folder. One index file includes the mapping of doc titles/summaries, DOIs, and IPFS CIDs, the index file name will be the folder's IPFS CID, so don't change it; (I will write the script and publish the GitHub repo in these weeks);

4. Go to https://fs.crust.network/ to apply for free storage of crust;

5. Follow the guidance to store each folder’s CID in Crust, keep IPFS running in this process;

6. After you have done the storage, create a pull request to the GitHub repo to upload your index files;

### Steps for developers

1. Setup a GitHub repo;

2. Write the script that torrent maintainers run;

3. Collect the index files pushed by all the torrent maintainers;

4. Develop a front-end that can use the index files;

5. Host the front-end on IPFS;

### Steps for the mirror maintainers

1. Download newest papers;

2. Migrate to IPFS and get pinned by Crust;

3. Update the index files;
