import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

const AdminDashboard: React.FC = () => {
  return (
    <Authenticator>
      {({ signOut }) => (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <h1>Welcome to Admin's Dashboard</h1>
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
        </div>
      )}
    </Authenticator>
  );
};

export default AdminDashboard;