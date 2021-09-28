import './App.css';
import React from 'react';
import 'antd/dist/antd.css';
import { Steps, Button, Upload, message, Table, Input, Progress } from 'antd';
import ReactMarkdown from 'react-markdown'

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

const InstallIpfsMarkdown = `
## Install
Follow this [link](https://docs.ipfs.io/install/) to download and run IPFS on your computer
## Check
Click the button to make sure ipfs is running properly
`

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
    return (
      <div>
        <ReactMarkdown children={InstallIpfsMarkdown}></ReactMarkdown>
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
      title: 'Title',
      render: text => <Input prefix={<KeyOutlined />} />
    },
    {
      title: 'DOI',
      render: text => <Input prefix={<BarcodeOutlined />} />
    },
    {
      title: 'Authors',
      render: text => <Input prefix={<UserOutlined />} />
    },
  ];

  const SelectPapersView = () => {
    const props = {
      directory: true,
      beforeUpload(_, fileList) {
        let tempPaperList = [];
        fileList.forEach((item) => {
          let paths = item.webkitRelativePath.split("/");
          if (paths.length >= 3 || paths[1] == "papers") {
            tempPaperList.push({ name: paths[1] + "/" + item.name });
          }
        });
        setPaperList(tempPaperList);
        return new Promise();
      },
      showUploadList: false,
    };
    return (
      <div>
        <Upload {...props}>
          <Button icon={<FolderOpenOutlined />}>Import folder</Button>
        </Upload>
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
    return (
      <div>
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

  const PRView= () => {
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
            Pull Request
          </Button>
        )}
      </div>
    </div>
  );
};

export default App;
