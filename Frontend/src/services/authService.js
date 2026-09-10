import API, { apiService } from './api';

/**
 * Customer authentication: calls POST /api/auth/customer-login
 * @param {string|object} email - Customer email string or credentials object
 * @param {string} [password] - Customer password
 */
export const customerLogin = async (email, password) => {
  const credentials = typeof email === 'object' && email !== null
    ? email
    : { email, password };
  return apiService.customerLogin(credentials);
};

/**
 * Admin authentication: calls POST /api/auth/admin-login
 * @param {string|object} email - Admin email string or credentials object
 * @param {string} [password] - Admin password
 */
export const adminLogin = async (email, password) => {
  const credentials = typeof email === 'object' && email !== null
    ? email
    : { email, password };
  return apiService.adminLogin(credentials);
};

/**
 * Customer Registration: calls POST /api/auth/register
 * Saves customer to users table with role 'customer'
 * @param {object} userData - { full_name, email, password, phone }
 */
export const registerCustomer = async (userData) => {
  return apiService.register(userData);
};

export const registerUser = async (userData) => {
  return apiService.register(userData);
};

export const loginUser = async (credentials) => {
  return apiService.login(credentials);
};

export const logout = async () => {
  return apiService.logout();
};

export default {
  customerLogin,
  adminLogin,
  registerCustomer,
  registerUser,
  loginUser,
  logout,
};