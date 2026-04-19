// src/layouts/Root/PermissionPrivateRoute.js
import React, { useContext, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../providers/AuthProvider';
import useUserPermissions from '../../Hook/useUserPermissions';

// A simple preloader component for a better user experience
const FullPageLoader = () => (
    <div className="flex items-center justify-center h-screen bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
);

const PermissionPrivateRoute = ({ children }) => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const { allowedRoutes, loading: permissionsLoading } = useUserPermissions();
    const location = useLocation();

    // 🚨 FIX 1: Network check to bypass infinite loader offline
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // 1. Show a loader ONLY if online. If offline, bypass immediately to cached UI.
    if ((authLoading || permissionsLoading) && isOnline) {
        return <FullPageLoader />;
    }

    // 2. If the user is not logged in, redirect them to the login page
    if (!user) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // 🚨 FIX 2: Protect allowedRoutes from being undefined
    const safeAllowedRoutes = allowedRoutes || [];

    // 3. If the user is logged in but doesn't have permission for this specific route, redirect them
    // 🚨 FIX 3: Replaced /dashboard/home with /doctor-patient because /dashboard/home doesn't exist
    if (!safeAllowedRoutes.includes(location.pathname) && location.pathname !== '/doctor-patient') {
        // Redirect to a safe default page
        return <Navigate to="/doctor-patient" replace />;
    }

    // 4. If all checks pass, render the requested component
    return children;
};

export default PermissionPrivateRoute;