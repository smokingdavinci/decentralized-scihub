import './App.css';
import React from 'react';
import 'antd/dist/antd.css';
import { Steps, Button, Upload, message } from 'antd';
import ReactMarkdown from 'react-markdown'
import fs from 'fs'

import {
  RadarChartOutlined,
  FileTextOutlined,
  EditOutlined,
  CalculatorOutlined,
  PullRequestOutlined,
  FolderOpenOutlined
} from '@ant-design/icons';

const { Step } = Steps;

const steps = [
  {
    title: 'Run IPFS',
    icon: <RadarChartOutlined />
  },
  {
    title: 'Prepare papers',
    icon: <FileTextOutlined />
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

  // IPFS part
  const checkIpfs = () => {
    message.info('Checking Ipfs');
    enableNext();
    message.success('Ipfs is running');
  };

  // Papers part
  const readPapersFolder = () => {
    var readDir = fs.readdirSync("./");
    message.info(readDir);
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
            <ReactMarkdown children={InstallIpfsMarkdown}></ReactMarkdown>
            <Button className="install-ipfs-check-button" type="primary" onClick={() => checkIpfs()}>
              Check
            </Button>
          </div>
        )}
        {current === 1 && (
          <div className="step-body">
            <Button icon={<FolderOpenOutlined />} onClick={() => readPapersFolder()}>Select folder</Button>
          </div>
        )}
        {current === 2 && (
          333333333333
        )}
      </div>

      <div className="steps-action">
        {current < steps.length - 1 && (
          <Button type="primary" disabled={nextDisable} onClick={() => next()}>
            Next
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button type="primary" onClick={() => message.success('Processing complete!')}>
            Done
          </Button>
        )}
      </div>
    </div>
  );
};

export default App;
