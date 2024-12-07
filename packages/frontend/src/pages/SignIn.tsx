import React, { useEffect } from 'react';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '@aws-amplify/ui-react/styles.css';

const Login: React.FC = () => {
  

  return (
    <Authenticator
      initialState="signIn"
      formFields={{
        signUp: {
          username: {
            label: "Email",
            placeholder: "Enter your email address",
            isRequired: true,
            order: 1,
          },
          name: {
            label: "Full Name",
            placeholder: "Enter your full name",
            isRequired: true,
            order: 2,
          },
          phone_number: {
            label: "Phone Number",
            placeholder: "Enter your phone number",
            isRequired: true,
            order: 3,
            dialCode: "+973",
          },
          password: {
            label: "Password",
            placeholder: "Create a password",
            isRequired: true,
            order: 4,
          },
        },
      }}
    >
      {() => <AuthenticatorContent />}
    </Authenticator>
  );
};

const AuthenticatorContent: React.FC = () => {
  const { route, user } = useAuthenticator((context) => [context.route, context.user]);
  const navigate = useNavigate();

  useEffect(() => {
    if (route === 'authenticated' && user) {
      // Send userId to the API
      sendUserIdToApi(user.username);
      navigate('/dashboard'); // Redirect after sending data
    }
  }, [route, user, navigate]);

  const sendUserIdToApi = async (userId: string) => {
    try {
      const response = await axios.post(
        'https://vuor0sdlpf.execute-api.us-east-1.amazonaws.com/adminDashboard/exportData',
        { userId }, // Payload
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('UserId sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending userId to API:', error);
    }
  };

  if (route !== 'authenticated') {
    return null; // Show nothing while waiting for the user to authenticate
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome Back, {user?.username}!</h1>
      <p>You are now signed in.</p>
    </div>
  );
};

export default Login;
