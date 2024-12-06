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
    userPoolId: 'us-east-1_rMGU0HI6v',
    userPoolClientId: '1nj7cq6ubj4291t4jqqd798kab',
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