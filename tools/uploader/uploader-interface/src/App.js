import './App.css';
import React from 'react';
import 'antd/dist/antd.css';
import { Steps, Button, Upload, message, Table, Input, Progress, Form } from 'antd';
import ReactMarkdown from 'react-markdown';
import overviewImgUrl from './pic/overview.png';
import outputImgUrl from './pic/output.png';
import passCdImgUrl from './pic/pass-cd.png';
import ipfsConfigImgUrl from './pic/ipfs-config.png';
import FileSaver from 'file-saver';
import JsZip from 'jszip'
import { create } from 'ipfs-http-client'

import {
  RadarChartOutlined,
  EditOutlined,
  CalculatorOutlined,
  ArrowDownOutlined,
  FolderOpenOutlined,
  UserOutlined,
  KeyOutlined,
  BarcodeOutlined,
} from '@ant-design/icons';

const { Step } = Steps;

const steps = [
  {
    title: 'Run IPFS',
    icon: <RadarChartOutlined />
  },
  {
    title: 'Fill metadata',
    icon: <EditOutlined />
  },
  {
    title: 'Generate',
    icon: <CalculatorOutlined />
  },
  {
    title: 'Output',
    icon: <ArrowDownOutlined />
  }];

const App = () => {
  const [nextDisable, setNextDisable] = React.useState(true);
  const disableNext = () => {
    setNextDisable(true);
  };
  const enableNext = () => {
    setNextDisable(false);
  };

  const [current, setCurrent] = React.useState(0);
  const next = () => {
    disableNext();
    if (current < 3) {
      setCurrent(current + 1);
    }
    document.documentElement.scrollTop = document.body.scrollTop = 0;
  };

  const checkIpfs = async () => {
    try {
      const client = create('http://127.0.0.1:5001')
      await client.version();
      message.success('Ipfs is running');
      enableNext();
    } catch (error) {
      disableNext();
      message.error('Ipfs is offline');
    }
  };

  const IPFSView = () => {
    const InstallIpfsMarkdown1 = `
## 1 Overview
To build an unstoppable SCIHub, We could migrate all the papers into [IPFS](https://ipfs.io/) and capture the indexs. Different from the centralized storage method, you first need to start an IPFS node locally and store the file in this node, so that the file exists in the P2P network. We will use the [Crust](https://crust.network/) to store files permanently, and the nodes on Crust will pull the files through P2P. After waiting for other nodes to pull the file, the local file can be deleted. This web page will help you through this process.
`

    const InstallIpfsMarkdown2 = `
## 2 Install IPFS
Follow this [link](https://docs.ipfs.io/install/ipfs-desktop/) to download and run IPFS on your device.

## 3 Allow cross-origin
Make sure you have configured to allow [cross-origin(CORS) requests](https://github.com/ipfs/ipfs-webui#configure-ipfs-api-cors-headers). Open the IPFS Desktop, enter the settings interface, change the API part of the IPFS CONFIG as shown below, **save and restart IPFS desktop**. 

Config:
\`\`\`
"API": {
  "HTTPHeaders": {
    "Access-Control-Allow-Methods": [
      "PUT",
      "POST"
    ],
    "Access-Control-Allow-Origin": ["*"]
  }
}
\`\`\`

Like:
`
const InstallIpfsMarkdown3 = `
## 4. Check
Click the button to make sure ipfs is running properly.
`
    return (
      <>
        <div className="step-body">
          <ReactMarkdown linkTarget="_blank">{InstallIpfsMarkdown1}</ReactMarkdown>
          <img className="overview-img" src={overviewImgUrl} alt="overview" />
          <ReactMarkdown linkTarget="_blank">{InstallIpfsMarkdown2}</ReactMarkdown>
          <img className="ipfs-config-img" src={ipfsConfigImgUrl} alt="overview" />
          <ReactMarkdown linkTarget="_blank">{InstallIpfsMarkdown3}</ReactMarkdown>
        </div>
        <div className="steps-action">
          <Button className="check-button" type="primary" onClick={() => checkIpfs()}>
            Check
          </Button>
          <Button type="primary" disabled={nextDisable} onClick={() => next()}>
            Next
          </Button>
        </div>
      </>
    );
  };

  //--------------------------------------------------------//
  const [paperList, setPaperList] = React.useState([]);
  const [paperMetadataList, setPaperMetadataList] = React.useState([]);
  const [paperForm] = Form.useForm();

  const checkMetadata = (values) => {
    if (values[0] === undefined) {
      disableNext();
      message.error('Please import papers');
    } else {
      if (values[100] !== undefined) {
        disableNext();
        message.error('The number of papers should not exceed 100');
      } else {
        let dois = {};
        let ts = {};
        for (let i in values) {
          if (dois[values[i].doi]) {
            disableNext();
            message.error("The doi '" + values[i].doi + "' is repeated");
            return;
          }
          if (ts[values[i].title]) {
            message.error("The title '" + values[i].title + "' is repeated");
            disableNext();
            return;
          }
          dois[values[i].doi] = true;
          ts[values[i].title] = true;
        }
        setPaperMetadataList(values);
        enableNext();
        message.success('Metadata is right');
      }
    }
  };

  const paperListColumns = [
    {
      title: 'Paper Name',
      dataIndex: 'path',
      key: 'path',
    },
    {
      title: '* Title',
      dataIndex: 'title',
      key: 'title',
      render: (value, row, index) => {
        return (
          <Form.Item name={[index, "title"]} rules={[{ required: true, },]} style={{ marginTop: 25 }}>
            <Input placeholder="abc" prefix={<KeyOutlined />} />
          </Form.Item>
        );
      }
    },
    {
      title: '* DOI',
      dataIndex: 'doi',
      key: 'doi',
      render: (value, row, index) => {
        return (
          <Form.Item name={[index, "doi"]} rules={[{ required: true, },]} style={{ marginTop: 25 }}>
            <Input placeholder="doi" prefix={<BarcodeOutlined />} />
          </Form.Item>
        );
      }
    },
    {
      title: '* Authors',
      dataIndex: 'authors',
      key: 'authors',
      render: (value, row, index) => {
        return (
          <Form.Item name={[index, "authors"]} rules={[{ required: true, },]} style={{ marginTop: 25 }}>
            <Input placeholder="alice;bob" prefix={<UserOutlined />} />
          </Form.Item>
        );
      }
    }
  ];

  const SelectPapersView = () => {
    const props = {
      directory: true,
      beforeUpload(_, fileList) {
        let tempPaperList = [];
        fileList.forEach((item) => {
          let paths = item.webkitRelativePath.split("/");
          if (paths.length === 2) {
            tempPaperList.push({ path: item.name, content: item });
          }
        });
        setPaperList(tempPaperList);
        disableNext();
        return new Promise();
      },
      showUploadList: false,
    };

    const preparePapersMarkdown1 = `
## Introduction
This step will guide you how to organize the papers and help you fill in the metadata related to the papers.

## Prepare files
First, you need to create a new folder and put the papers you want to upload into the same folder. Please note:

- The number of papers should not exceed 100
- There can be no other files in the folder

## Import folder
The browser needs to determine the contents of the folder by importing. There is no privacy risk in this step. Please click this link for the open source [code](https://github.com/smokingdavinci/decentralized-scihub). Please select a folder in the import step:
`
    const preparePapersMarkdown2 = `
## Fill metadata
Please fill in the necessary content of the paper in the form below, where Title and DOI are mandatory. Authors should be separated by semicolons:
`
    return (
      <Form form={paperForm} onFinish={checkMetadata}>
        <>
          <div className="step-body">
            <ReactMarkdown linkTarget="_blank">{preparePapersMarkdown1}</ReactMarkdown>
            <Upload {...props}>
              <Button icon={<FolderOpenOutlined />}>Import folder</Button>
            </Upload>
            <ReactMarkdown linkTarget="_blank">{preparePapersMarkdown2}</ReactMarkdown>
            <Table dataSource={paperList} columns={paperListColumns} pagination={false} rowKey={record => record.num} />
          </div>
          <div className="steps-action">
            <Form.Item >
              <Button className="check-button" type="primary" htmlType="submit" >
                Check
              </Button>
              <Button type="primary" disabled={nextDisable} onClick={() => next()}>
                Next
              </Button>
            </Form.Item>
          </div>
        </>
      </Form>
    );
  };

  //--------------------------------------------------------//
  const [resultRoot, setResultRoot] = React.useState("");
  const [resultFiles, setResultFiles] = React.useState([]);
  const [ipfsUploadPercentage, setIpfsUploadPercentage] = React.useState(0);
  const [nowUploadPaper, setNowUploadPaper] = React.useState("Not start");

  const ipfsAddFiles = async (files) => {
    const client = create('http://127.0.0.1:5001')
    let rootCid = ''
    let res = {}
    let dirCid = await client.object.new({
      template: 'unixfs-dir'
    })
    let finshedIpfsUpload = 0;
    for (let i = 0; i < files.length; i++) {
      setNowUploadPaper(files[i].path);
      const item = await client.add(files[i])
      const cid = item.cid.toString()
      res[item.path] = {
        cid: cid,
        size: item.size
      }
      dirCid = await client.object.patch.addLink(dirCid, {
        name: item.path,
        size: item.size,
        cid: cid
      })
      finshedIpfsUpload += 100;
      setIpfsUploadPercentage(finshedIpfsUpload / paperList.length);
    }
    rootCid = dirCid.toString()
    const dirStat = await client.object.stat(rootCid)
    res[''] = {
      cid: rootCid,
      size: dirStat['CumulativeSize']
    }
    return res
  }

  const checkGenerate = async () => {
    // Upload files to ipfs
    let ipfsRes = undefined;
    try {
      ipfsRes = await ipfsAddFiles(paperList);
    } catch (error) {
      message.error('Ipfs is offline');
      return
    }
    setNowUploadPaper("Upload to local IPFS successfully!");

    // Get output
    let tempMetaInfo = {
      cid: ipfsRes['']['cid'],
      size: ipfsRes['']['size'],
      links: [],
    };
    let tempResultFiles = [];
    let index = 0;

    paperList.forEach((item) => {
      let tempDoiFileList = {
        cid: ipfsRes[item.path]['cid'],
        size: ipfsRes[item.path]['size'],
        doi: paperMetadataList[index].doi,
        path: item.path,
        title: paperMetadataList[index].title,
        authors: paperMetadataList[index].authors
      };
      tempMetaInfo.links.push({
        cid: ipfsRes[item.path]['cid'],
        doi: paperMetadataList[index].doi
      });
      tempResultFiles.push({ path: tempDoiFileList['doi'], content: JSON.stringify(tempDoiFileList) });
      index++
    });

    tempResultFiles.push({ path: 'meta', content: JSON.stringify(tempMetaInfo) });
    setResultFiles(tempResultFiles);
    setResultRoot(tempMetaInfo.cid);
    enableNext();
  };

  const GenerateView = () => {
    const generateViewMarkdown = `
## Introduction
In this step, the program will save the folder to your local IPFS node, please note:

- This will take some time, depending on the performance of the machine
- Please ensure that the local IPFS node is online
- The result will be temporarily stored in the memory, please do not close the browser or refresh the page

Click generate below to run the program:
 `
    return (
      <>
        <div className="step-body">
          <ReactMarkdown linkTarget="_blank">{generateViewMarkdown}</ReactMarkdown>
          <Progress percent={ipfsUploadPercentage} />
          <p className="blue-text">Status: {nowUploadPaper}</p>
        </div >
        <div className="steps-action">
          <Button className="check-button" type="primary" onClick={() => checkGenerate()}>
            Generate
          </Button>
          <Button type="primary" disabled={nextDisable} onClick={() => next()}>
            Next
          </Button>
        </div>
      </>
    );
  };

  const resultFilesColumns = [
    {
      title: 'File Name',
      dataIndex: 'path',
      key: 'path',
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
    },
  ];

  const dowloadViewMarkdown1 = `
## 1 Download output
Check the output content and click the download button to download the compressed package composed of the output files.

## 2 Send pull request
- Fork the [decentralized-scihub](https://github.com/smokingdavinci/decentralized-scihub) repository.
- Clone your repository and unzip the output files and put it in the papers folder, the following is an example:
`

  const dowloadViewMarkdown2 = `
- Create new branch and send pull request

## 3 Wait CD pass (DO NOT CLOSE IPFS)
Wait for the PR to be approved by the admins and merged into repository, and the background CD will store the papers on Crust. This will take some time, usually around 2 hours to 3 hours.

During this process, other IPFS nodes will pull files from the local machine. **Please ensure that the local network is smooth and keep the local IPFS online.** When the number of copies reaches a certain number, CD will be passed, which means that the papers is stored successfully.
`

  const dowloadViewMarkdown3 = `
## 4 Output information
`
  const downloadFile = () => {
    const zip = new JsZip();
    resultFiles.forEach((item) => {
      let blob = new Blob([item.content], { type: "text/plain;charset=utf-8" });
      zip.file(item.path.replace('/', '%'), blob);
    });
    zip.generateAsync({ type: "blob" }).then(function (content) {
      FileSaver.saveAs(content, resultRoot);
    });
  };

  const OutputView = () => {
    return (
      <>
        <div className="step-body">
          <ReactMarkdown linkTarget="_blank">{dowloadViewMarkdown1}</ReactMarkdown>
          <img className="output-img" src={outputImgUrl} alt="output" />
          <ReactMarkdown linkTarget="_blank">{dowloadViewMarkdown2}</ReactMarkdown>
          <img className="pass-cd-img" src={passCdImgUrl} alt="output" />
          <ReactMarkdown linkTarget="_blank">{dowloadViewMarkdown3}</ReactMarkdown>
          <font size="4">Root: {resultRoot}</font>
          <Button className="output-button" type="primary" onClick={() => downloadFile()}>
            Save output
          </Button>
          <Table dataSource={resultFiles} columns={resultFilesColumns} pagination={false} rowKey={record => record.num} />
        </div >
      </>
    );
  };

  return (
    <div className="main-div">
      <Steps current={current}>
        {steps.map(item => (
          <Step key={item} title={item.title} icon={item.icon} />
        ))}
      </Steps>
      <div>
        {current === 0 && (<IPFSView />)}
        {current === 1 && (<SelectPapersView />)}
        {current === 2 && (<GenerateView />)}
        {current === 3 && (<OutputView />)}
      </div>
    </div>
  );
};

export default App;
