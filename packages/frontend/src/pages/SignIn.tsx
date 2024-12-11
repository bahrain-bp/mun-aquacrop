import React, { useEffect } from 'react';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from 'aws-amplify/auth';
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
    const handlePostSignIn = async () => {
      if (route === 'authenticated' && user) {
        try {
          // Fetch the authentication session using fetchAuthSession
          const session = await fetchAuthSession();
          const groups = session?.tokens?.accessToken?.payload["cognito:groups"];

          // Check if the user is an admin
          if (Array.isArray(groups) && groups.includes("Admin")) {
            console.log("Redirecting to AdminDashboard");
            await sendUserIdToApi(user.username);
            navigate('/AdminDashboard');
          } else {
            console.log("Redirecting to Dashboard");
            await sendUserIdToApi(user.username); // Send user data to the backend
            navigate('/dashboard');
          }
        } catch (error) {
          console.error("Error during post-sign-in processing:", error);
        }
      }
    };

    handlePostSignIn();
  }, [route, user, navigate]);

  const sendUserIdToApi = async (userId: string) => {
    try {
      const response = await axios.post(
        'https://vuor0sdlpf.execute-api.us-east-1.amazonaws.com/managerDashboard/exportData',
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
