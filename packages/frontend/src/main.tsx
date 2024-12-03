import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import config from './amplifyconfiguration.json';
import App from './App';
import '@aws-amplify/ui-react/styles.css'; // Import default Amplify UI styles
import './index.css';

Amplify.configure(config);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
