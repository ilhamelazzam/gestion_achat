import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated, logout } from '../utils/auth';

const PrivateRoute = ({ adminOnly = false }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        if (!isAuthenticated()) {
          throw new Error('Not authenticated');
        }

        // If adminOnly is true, check if user is admin
        if (adminOnly) {
          const user = JSON.parse(localStorage.getItem('user'));
          if (!user || !(user.isAdmin || user.is_staff || user.is_superuser)) {
            throw new Error('Not authorized');
          }
        }

        setIsAuthorized(true);
      } catch (err) {
        setError(err.message);
        // Clear invalid auth data
        if (err.message === 'Not authenticated' || err.message === 'Not authorized') {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [adminOnly]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Navigate
        to="/login"
        state={{ from: location, error: error }}
        replace
      />
    );
  }

  return isAuthorized ? <Outlet /> : null;
};

export default PrivateRoute;
