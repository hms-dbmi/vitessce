import React from 'react';
import ReactDOM from 'react-dom';

import './css/file-drop.css';
import './css/index.css';

import { FileManagerPublisher } from './components/fileManager';
import { SpatialSubscriber } from './components/spatial';
import { TsneSubscriber } from './components/tsne';


ReactDOM.render(
  <FileManagerPublisher />,
  document.getElementById('filemanager')
);

ReactDOM.render(
  <TsneSubscriber />,
  document.getElementById('tsne')
);

ReactDOM.render(
  <SpatialSubscriber />,
  document.getElementById('spatial')
);
