import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiService } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = async (emailOrUserData, passwordOrToken, role = 'customer') => {
    // Helper to decode role from JWT token string
    const extractRoleFromJwt = (jwtString) => {
      if (!jwtString || typeof jwtString !== 'string' || !jwtString.includes('.')) return null;
      try {
        const payloadBase64 = jwtString.split('.')[1];
        if (!payloadBase64) return null;
        const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const parsed = JSON.parse(jsonPayload);
        return parsed.role || null;
      } catch {
        return null;
      }
    };

    // If called with (userData, token), support direct session initialization
    if (typeof emailOrUserData === 'object' && emailOrUserData !== null) {
      const userData = emailOrUserData;
      const authToken = passwordOrToken;
      const jwtRole = extractRoleFromJwt(authToken);
      const resolvedRole = jwtRole || userData.role || role || 'customer';

      setUser({ ...userData, role: resolvedRole });
      setToken(authToken);
      localStorage.setItem('user', JSON.stringify({ ...userData, role: resolvedRole }));
      localStorage.setItem('role', resolvedRole);
      if (authToken) localStorage.setItem('token', authToken);
      return { user: userData, token: authToken, role: resolvedRole };
    }

    // Modern signature: login(email, password, role)
    const email = emailOrUserData;
    const password = passwordOrToken;
    const targetRole = role || 'customer';

    let res;
    if (targetRole === 'admin') {
      res = await apiService.adminLogin({ email, password });
    } else {
      res = await apiService.customerLogin({ email, password });
    }

    const { token: authToken, user: userData } = res.data?.data || res.data || {};
    if (!authToken || !userData) {
      throw new Error(res.data?.message || 'Invalid email or password');
    }

    // Extract role strictly from the signed JWT token, falling back to userData
    const jwtRole = extractRoleFromJwt(authToken);
    const verifiedRole = jwtRole || userData.role || targetRole;

    if (verifiedRole !== targetRole) {
      throw new Error('Invalid email or password');
    }

    setUser({ ...userData, role: verifiedRole });
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify({ ...userData, role: verifiedRole }));
    localStorage.setItem('token', authToken);
    localStorage.setItem('role', verifiedRole);

    return { user: userData, token: authToken, role: verifiedRole };
  };

  const logout = async (customRedirectPath = null) => {
    try {
      // Optional backend server-side session invalidation
      if (apiService && apiService.logout) {
        await apiService.logout().catch(() => {});
      }
    } catch (error) {
      console.warn('Backend logout endpoint notice:', error?.message);
    }

    const adminLoginPath = import.meta.env.VITE_ADMIN_LOGIN_PATH || '/admin/login';
    const redirectPath = customRedirectPath || (user?.role === 'admin' ? adminLoginPath : '/login');

    // 1. Clear JWT tokens, session data, and cached stats from localStorage and sessionStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    localStorage.removeItem('role');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('user_token');
    localStorage.removeItem('galaxy_admin_stats');
    sessionStorage.clear();

    // 2. Dispatch custom event to clear in-memory stale state (e.g. BookingContext selections)
    try {
      window.dispatchEvent(new CustomEvent('app:logout'));
    } catch (err) {
      console.warn('Logout event broadcast error:', err);
    }

    // 3. Reset user and authentication state in context
    setUser(null);
    setToken(null);

    // 4. Show success toast notification
    toast.success('Logged out successfully');

    // 5. Redirect to target login route immediately with history replace to block back navigation
    if (redirectPath) {
      navigate(redirectPath, { replace: true });
    }
  };

  const isAuthenticated = Boolean(token);
  const isAdmin = Boolean(user && (user.role === 'admin' || user.is_admin));
  const role = user?.role || (isAdmin ? 'admin' : (isAuthenticated ? 'customer' : null));

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        loading
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
