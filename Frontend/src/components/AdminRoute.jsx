import React, { useContext, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ADMIN_LOGIN_PATH = import.meta.env.VITE_ADMIN_LOGIN_PATH || '/admin/login';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isAdmin } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Enforce route protection against browser back button / bfcache
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
        navigate(ADMIN_LOGIN_PATH, { replace: true });
        return;
      }

      // If logged in as customer, redirect to customer login
      if (parsedUser.role === 'customer') {
        navigate('/login', { replace: true });
        return;
      }

      if (parsedUser.role !== 'admin' && !parsedUser.is_admin) {
        navigate(ADMIN_LOGIN_PATH, { replace: true });
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
    return <Navigate to={ADMIN_LOGIN_PATH} state={{ from: location }} replace />;
  }

  // Cross-role protection: if customer tries to access admin routes, redirect to /login
  if (user.role === 'customer') {
    return <Navigate to="/login" replace />;
  }

  // Must be admin
  const isAuthorized = Boolean(user.role === 'admin' || user.is_admin || isAdmin);
  if (!isAuthorized) {
    return <Navigate to={ADMIN_LOGIN_PATH} state={{ from: location }} replace />;
  }

  return children;
};

export default AdminRoute;
