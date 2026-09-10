import React, { useContext, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Guard against browser back button / bfcache
  useEffect(() => {
    const handlePopState = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      let parsedUser = null;
      try {
        parsedUser = storedUser ? JSON.parse(storedUser) : null;
      } catch {
        parsedUser = null;
      }

      if (!storedToken || !parsedUser) {
        navigate('/login', { replace: true });
        return;
      }

      // If logged in as admin, redirect to admin dashboard
      if (parsedUser.role === 'admin' || parsedUser.is_admin) {
        navigate('/admin/dashboard', { replace: true });
        return;
      }

      // If not customer, redirect to /login
      if (parsedUser.role !== 'customer') {
        navigate('/login', { replace: true });
      }
    };

    const handlePageShow = (event) => {
      if (event.persisted) {
        handlePopState();
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [navigate]);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Cross-role protection: If an admin tries to visit customer-only routes, redirect to admin dashboard
  if (user.role === 'admin' || user.is_admin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Must be customer role
  if (user.role !== 'customer') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;