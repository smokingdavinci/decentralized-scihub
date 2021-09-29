# Decentralized Knowledge Hosting

## The Goal

To build an unstoppable SCIHub, We could migrate all the papers into IPFS and capture the indexs, then develop a mirror page that retrieves all the papers from IPFS. It's very hard to download 80+TB of data and pinning them by one person. It will be very helpful if we could have a co-work with all the paper maintainers and developers.

## About This Repo

We use this repo to collaborate in the following areas:
- Write a script to assist torrent maintainers to put the document on IPFS;
- Collect the index files pushed by all the torrent maintainers (index file is the result of the script execution);
- Develop a front-end that can use the index files;
- Host the front-end on IPFS;

## Usage

### How to upload papers

> Note: this part has not yet been completed

1. Unzip the papers, pack those docs into several folders, ensure that the size of each folder is about 5GB;
2. Download and run IPFS on your computer;
3. Add a new issue to apply for free CRU, which will help you store those docs on decentralized storage network;
4. Download this repo and run the script in each folder, it will:
    - Store the folders in your loacal IPFS node and generate IPFS CIDs for the folder and each paper.
    - Use CRU to place store order on Crust and those docs will be stored on Crust 
    - Wait for the Crust chain to confirm that the storage is complete 
    - Generate an index file for the papers in each folder. One index file includes the mapping of doc titles/summaries, DOIs, and IPFS CIDs, the index file name will be the folder's IPFS CID;

5. After you have done the storage, create a pull request to this gitHub repo to upload your index files;

### How to contribute code
Thank you for considering to help out with the source code! Welcome contributions from anyone on the internet, and are grateful for even the smallest of fixes!
If you'd like to contribute to crust, please **fork, fix, commit and send a pull request for the maintainers to review and merge into the main codebase**.

#### Rules
Please make sure your contribution adhere to our coding guideliness:
- **No --force pushes** or modifying the main branch history in any way. If you need to rebase, ensure you do it in your own repo.
- Pull requests need to be based on and opened against the `master branch`.
- A pull-request **must not be merged until CI** has finished successfully.
- Make sure your every `commit` is [signed](https://help.github.com/en/github/authenticating-to-github/about-commit-signature-verification)
