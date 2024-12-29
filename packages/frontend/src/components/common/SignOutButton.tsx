import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut as amplifySignOut } from 'aws-amplify/auth';

interface SignOutButtonProps {
    onSignOut?: () => void;
}

const SignOutButton: React.FC<SignOutButtonProps> = ({ onSignOut }) => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            localStorage.setItem('isSigningOut', 'true');
            await amplifySignOut({ global: true });
            onSignOut?.();
            navigate('/SignIn');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <button
            onClick={handleSignOut}
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
    );
};

export default SignOutButton;
