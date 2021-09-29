import './App.css';
import React from 'react';
import 'antd/dist/antd.css';
import { Steps, Button, Upload, message, Table, Input, Progress } from 'antd';
import ReactMarkdown from 'react-markdown'
import overviewImgUrl from './pic/overview.png';

import {
  RadarChartOutlined,
  EditOutlined,
  CalculatorOutlined,
  PullRequestOutlined,
  FolderOpenOutlined,
  UserOutlined,
  KeyOutlined,
  BarcodeOutlined,
  FileTextOutlined,
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
    title: 'Pull request',
    icon: <PullRequestOutlined />
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
    setCurrent(current + 1);
    document.documentElement.scrollTop = document.body.scrollTop = 0;
  };

  const checkIpfs = () => {
    message.info('Checking ipfs');
    enableNext();
    message.success('Ipfs is running');
  };

  const checkMetadata = () => {
    message.info('Checking metadata');
    enableNext();
    message.success('Metadata is right');
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
      <div>
        <ReactMarkdown linkTarget="_blank">{InstallIpfsMarkdown1}</ReactMarkdown>
        <img className="overview-img" src={overviewImgUrl} />
        <ReactMarkdown linkTarget="_blank">{InstallIpfsMarkdown2}</ReactMarkdown>
      </div >
    );
  };

  const [paperList, setPaperList] = React.useState([]);
  const paperListColumns = [
    {
      title: 'Paper Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '*Title',
      render: text => <Input prefix={<KeyOutlined />} />
    },
    {
      title: '*DOI',
      render: text => <Input prefix={<BarcodeOutlined />} />
    },
    {
      title: 'Authors',
      render: text => <Input placeholder="alice;bob" prefix={<UserOutlined />} />
    },
  ];

  const SelectPapersView = () => {
    const props = {
      directory: true,
      beforeUpload(_, fileList) {
        let tempPaperList = [];
        fileList.forEach((item) => {
          let paths = item.webkitRelativePath.split("/");
          if (paths.length == 2) {
            tempPaperList.push({ name: item.name });
          }
        });
        setPaperList(tempPaperList);
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

Fill in the absolute path of the folder in the space below:
`
    const preparePapersMarkdown2 = `
## Import folder
The browser needs to determine the contents of the folder by importing. There is no privacy risk in this step. Please click this link for the open source [code](https://github.com/smokingdavinci/decentralized-scihub). Please select a folder in the import step, and make sure that it is the same as the folder path filled in the previous step:
`

    const preparePapersMarkdown3 = `
## Fill metadata
Please fill in the necessary content of the article in the form below, where Title and DOI are mandatory. Authors should be separated by semicolons:
`
    return (
      <div>
        <ReactMarkdown linkTarget="_blank">{preparePapersMarkdown1}</ReactMarkdown>
        <Input placeholder="Absolute path; example: windows->/c/Users/abc/Desktop, mac->/User/abc/Desktop/papers, linux->/home/abc/Desktop/papers" />
        <ReactMarkdown linkTarget="_blank">{preparePapersMarkdown2}</ReactMarkdown>
        <Upload {...props}>
          <Button icon={<FolderOpenOutlined />}>Import folder</Button>
        </Upload>
        <ReactMarkdown linkTarget="_blank">{preparePapersMarkdown3}</ReactMarkdown>
        <Table dataSource={paperList} columns={paperListColumns} rowKey={record => record.num} />
      </div>
    );
  };

  const [resultRoot, setResultRoot] = React.useState("");
  const [resultFiles, setResultFiles] = React.useState([]);

  const checkGenerate = () => {
    message.info('Generating');
    setGenerateStep(generateStep + 1);
    if (generateStep > 1) {
      setResultRoot("QmVUWhE5n23KtQ8wSTkYhgCaHALDFarfj31SigiNZvmKEc");
      let rfs = [
        {
          name: "DOI1xxxxxxxxxxxxxxxxxxxxxxxxxxxxx1",
          content: "1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx1"
        },
        {
          name: "DOI2xxxxxxxxxxxxxxxxxxxxxxxxxxxxx2",
          content: "2xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx2"
        },
        {
          name: "meta",
          content: "mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm"
        },
      ]
      setResultFiles(rfs);
      enableNext();
    }
  };

  const [generateStep, setGenerateStep] = React.useState(0);
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
      <div>
        <ReactMarkdown linkTarget="_blank">{generateViewMarkdown}</ReactMarkdown>
        {generateStep > 0 && (
          <div>
            <font size="5" color="green">Base information generated successfully!</font>
          </div>
        )}
        {generateStep > 1 && (
          <div>
            <div>
              <font size="5">Upload files to ipfs:</font>
            </div>
            <Progress type="circle" percent={75} />
          </div >
        )}
        {generateStep > 2 && (
          <div>
            <font size="5" color="green">Generate result files successfully!</font>
          </div>
        )}
      </div >
    );
  };

  const resultFilesColumns = [
    {
      title: 'File Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
    },
  ];

  const PRView = () => {
    return (
      <div>
        <font size="5">{resultRoot}</font>
        <Table dataSource={resultFiles} columns={resultFilesColumns} rowKey={record => record.num} />
      </div >
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
        {current === 0 && (
          <div className="step-body">
            <IPFSView />
          </div>
        )}
        {current === 1 && (
          <div className="step-body">
            <SelectPapersView />
          </div>
        )}
        {current === 2 && (
          <div className="step-body">
            <GenerateView />
          </div>
        )}
        {current === 3 && (
          <div className="step-body">
            <PRView />
          </div>
        )}
      </div>

      <div className="steps-action">
        {current === 0 && (
          <div>
            <Button className="check-button" type="primary" onClick={() => checkIpfs()}>
              Check
            </Button>
            <Button type="primary" disabled={nextDisable} onClick={() => next()}>
              Next
            </Button>
          </div>
        )}
        {current === 1 && (
          <div>
            <Button className="check-button" type="primary" onClick={() => checkMetadata()}>
              Check
            </Button>
            <Button type="primary" disabled={nextDisable} onClick={() => next()}>
              Next
            </Button>
          </div>
        )}
        {current === 2 && (
          <div>
            <Button className="check-button" type="primary" onClick={() => checkGenerate()}>
              Generate
            </Button>
            <Button type="primary" disabled={nextDisable} onClick={() => next()}>
              Next
            </Button>
          </div>
        )}
        {current === steps.length - 1 && (
          <Button type="primary" onClick={() => message.success('Send pull Request')}>
            Save output
          </Button>
        )}
      </div>
    </div>
  );
};

export default App;
