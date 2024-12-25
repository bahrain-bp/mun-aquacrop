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
  const { route, user, authStatus } = useAuthenticator((context) => [
    context.route,
    context.user,
    context.authStatus
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    // Cleanup function to remove the signout flag
    return () => {
      localStorage.removeItem('isSigningOut');
    };
  }, []);

  useEffect(() => {
    const handlePostSignIn = async () => {
      // Only proceed if properly authenticated and not in initial loading state
      if (route === 'authenticated' && authStatus === 'authenticated' && user) {
        try {
          const session = await fetchAuthSession();
          const groups = session?.tokens?.accessToken?.payload["cognito:groups"];

          // Navigate based on user group
          if (Array.isArray(groups) && groups.includes("Admin")) {
            await sendUserIdToApi(user.username);
            navigate('/AdminDashboard', { replace: true });
          } else {
            await sendUserIdToApi(user.username);
            navigate('/dashboard', { replace: true });
          }
        } catch (error) {
          console.error("Error during post-sign-in processing:", error);
        }
      }
    };

    handlePostSignIn();
  }, [route, user, authStatus, navigate]);

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

  // Remove the welcome message render
  return null;
};

export default Login;
