import apiClient from '../utils/api';

// Authentication Service
const authService = {
  // Register Client
  registerClient: async (userData) => {
    return await apiClient('/auth/register/client', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Register Lawyer
  registerLawyer: async (userData) => {
    return await apiClient('/auth/register/lawyer', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Login
  login: async (credentials) => {
    return await apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export default authService;
