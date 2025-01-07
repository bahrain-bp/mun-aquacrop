import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fetchAuthSession } from 'aws-amplify/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    adminForbidden?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminForbidden = false }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const session = await fetchAuthSession();
                const groups = session?.tokens?.accessToken?.payload["cognito:groups"] || [];
                setIsAdmin(Array.isArray(groups) && groups.includes("Admin"));
            } catch (error) {
                console.error("Auth check failed:", error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        return null; // or a loading spinner
    }

    if (adminForbidden && isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
