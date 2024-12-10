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
    userPoolId: 'us-east-1_yn913oCJF',
    userPoolClientId: '35nso14b45f4m802im3ifg5se2',
  },
},
API: {
  REST: {
    YourAPIName: {
      endpoint:
        'https://vuor0sdlpf.execute-api.us-east-1.amazonaws.com/',
      region: 'us-east-1'
    }
  }
}

}
);