import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fetchAuthSession } from 'aws-amplify/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const session = await fetchAuthSession();
                const groups = session?.tokens?.accessToken?.payload["cognito:groups"];
                setIsAdmin(Array.isArray(groups) && groups.includes("Admin"));
            } catch (error) {
                console.error("Error checking admin status:", error);
                setIsAdmin(false);
            }
        };

        checkAdmin();
    }, []);

    if (isAdmin === null) {
        return <div>Loading...</div>;
    }

    return isAdmin ? <>{children}</> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
