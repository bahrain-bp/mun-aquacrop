import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';

const Login: React.FC = () => {
  return (
    <Authenticator initialState="signIn">
      {({ signOut, user }) => (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h1>Welcome Back, {user?.username}!</h1>
          <button
            onClick={signOut}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              borderRadius: '5px',
              border: 'none',
              backgroundColor: '#FF0000',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>
      )}
    </Authenticator>
  );
};

export default Login;
