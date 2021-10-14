import './App.css';
import React from 'react';
import 'antd/dist/antd.css';
import { Steps, Button, Upload, message, Table, Input, Progress, Form } from 'antd';
import ReactMarkdown from 'react-markdown';
import overviewImgUrl from './pic/overview.png';
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
      message.error('Ipfs is offline');
    }
  };

  const IPFSView = () => {
    const InstallIpfsMarkdown1 = `
## Overview
To build an unstoppable SCIHub, We could migrate all the papers into [IPFS](https://ipfs.io/) and capture the indexs. Different from the centralized storage method, you first need to start an IPFS node locally and store the file in this node, so that the file exists in the P2P network. We will use the [Crust](https://crust.network/) to store files permanently, and the nodes on Crust will pull the files through P2P. After waiting for other nodes to pull the file, the local file can be deleted. This web page will help you through this process.
`

    const InstallIpfsMarkdown2 = `
## Install IPFS
Follow this [link](https://docs.ipfs.io/install/) to download and run IPFS on your computer.

## Check
Click the button to make sure ipfs is running properly.
`
    return (
      <>
        <div className="step-body">
          <ReactMarkdown linkTarget="_blank">{InstallIpfsMarkdown1}</ReactMarkdown>
          <img className="overview-img" src={overviewImgUrl} />
          <ReactMarkdown linkTarget="_blank">{InstallIpfsMarkdown2}</ReactMarkdown>
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
    message.info('Checking metadata');
    setPaperMetadataList(values);
    enableNext();
    message.success('Metadata is right');
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
    },
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
This step will guide you how to organize the articles and help you fill in the metadata related to the articles.

## Prepare files
First, you need to create a new folder and put the articles you want to upload into the same folder. Please note:

- The number of articles should not exceed 100
- There can be no other files in the folder

## Import folder
The browser needs to determine the contents of the folder by importing. There is no privacy risk in this step. Please click this link for the open source [code](https://github.com/smokingdavinci/decentralized-scihub). Please select a folder in the import step:
`
    const preparePapersMarkdown2 = `
## Fill metadata
Please fill in the necessary content of the article in the form below, where Title and DOI are mandatory. Authors should be separated by semicolons:
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

  const ipfsAddFiles = async (files) => {
    const client = create('http://127.0.0.1:5001')
    let rootCid = ''
    let res = {}
    let dirCid = await client.object.new({
      template: 'unixfs-dir'
    })
    let finshedIpfsUpload = 0;
    for (let i = 0; i < files.length; i++) {
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
    let ipfsRes = await ipfsAddFiles(paperList);

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
          <Progress type="circle" percent={ipfsUploadPercentage} />
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

  const downloadFile = () => {
    const zip = new JsZip
    resultFiles.forEach((item) => {
      let blob = new Blob([item.content], { type: "text/plain;charset=utf-8" });
      zip.file(item.path, blob);
    });
    zip.generateAsync({ type: "blob" }).then(function (content) {
      FileSaver.saveAs(content, resultRoot);
    });
  };

  const OutputView = () => {
    return (
      <>
        <div className="step-body">
          <font size="5">All papers root: {resultRoot}</font>
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
