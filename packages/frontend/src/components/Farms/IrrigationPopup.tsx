import React, { useEffect } from 'react';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '@aws-amplify/ui-react/styles.css';

const Login: React.FC = () => {
    // Define a custom theme to match the IrrigationPopup theme
    const customTheme = {
        // Customize the background and text colors
        container: {
            backgroundColor: '#1f2937', // Dark background to match bg-gray-900
        },
        formField: {
            input: {
                backgroundColor: '#2d3748',  // Dark background for input fields
                color: '#f3f4f6',  // Light text color for inputs
                borderColor: '#4b5563', // Dark border for input fields
            },
            label: {
                color: '#f3f4f6',  // Light label color
            },
            hint: {
                color: '#e5e7eb', // Light hint text color
            },
        },
        button: {
            backgroundColor: '#3b82f6',  // Blue button color to match the theme
            color: 'white',
            hover: {
                backgroundColor: '#2563eb',  // Darker blue on hover
            },
        },
        errorMessage: {
            color: '#ef4444',  // Red color for error messages
        },
        signInButton: {
            backgroundColor: '#10b981', // Green color for sign-in button
            color: 'white',
            hover: {
                backgroundColor: '#059669', // Darker green for hover
            },
        },
    };

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
            theme={customTheme} // Apply the custom theme here
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
