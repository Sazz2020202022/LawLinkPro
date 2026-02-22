import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
const AUTH_BASE_PATH = /\/api$/i.test(API_BASE_URL) ? '/auth' : '/api/auth';

const parseApiError = (error, fallbackMessage) => {
  return error?.response?.data?.message || error?.message || fallbackMessage;
};

const isTokenValid = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payload = JSON.parse(atob(padded));
    if (typeof payload?.exp !== 'number') {
      return true;
    }
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const authApi = useMemo(() => {
    const instance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const currentUser = localStorage.getItem('user');

    if (!token || !isTokenValid(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setLoading(false);
      return;
    }

    if (currentUser) {
      try {
        setUser(JSON.parse(currentUser));
      } catch {
        localStorage.removeItem('user');
        setUser(null);
      }
    }

    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const { data } = await authApi.post(`${AUTH_BASE_PATH}/login`, credentials);
      if (data?.token) {
        localStorage.setItem('token', data.token);
      }
      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      }
      return data;
    } catch (error) {
      throw new Error(parseApiError(error, 'Login failed. Please try again.'));
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await authApi.post(`${AUTH_BASE_PATH}/register`, userData);
      if (data?.token) {
        localStorage.setItem('token', data.token);
      }
      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      }
      return data;
    } catch (error) {
      throw new Error(parseApiError(error, 'Registration failed. Please try again.'));
    }
  };

  const registerClient = async (userData) => {
    return register({ ...userData, role: 'client' });
  };

  const registerLawyer = async (userData) => {
    return register({ ...userData, role: 'lawyer' });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    registerClient,
    registerLawyer,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
