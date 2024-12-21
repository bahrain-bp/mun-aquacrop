import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';

interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    return (
        <Authenticator>
            {({ signOut }) => (
                <header className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg border-b border-gray-700">
                    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                        {/* Flex container to position title and button */}
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-semibold text-gray-100">{title}</h1>
                            {/* Sign Out button positioned to the right */}
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
                </header>
            )}
        </Authenticator>
    );
};

export default Header;
