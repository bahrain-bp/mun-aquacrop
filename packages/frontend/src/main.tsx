import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import App from './App';
import '@aws-amplify/ui-react/styles.css'; // Import default Amplify UI styles
import './index.css';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

Amplify.configure({
  Auth: {
    Cognito:{
    userPoolId: 'us-east-1_5LOytyLcW',
    userPoolClientId: '1u4gh4icraa6q3h9sjunjjui63',
  },
}
}
);