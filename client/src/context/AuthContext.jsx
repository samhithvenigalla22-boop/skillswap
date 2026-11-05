import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('skillswap_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('skillswap_token'));
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('skillswap_token');
      if (savedToken) {
        try {
          const data = await authService.getMe();
          if (data && data.user) {
            setUser(data.user);
            localStorage.setItem('skillswap_user', JSON.stringify(data.user));
          }
        } catch (error) {
          console.warn('Session expired or invalid, logging out:', error.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    if (data && data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('skillswap_token', data.token);
      localStorage.setItem('skillswap_user', JSON.stringify(data.user));
    }
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    if (data && data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('skillswap_token', data.token);
      localStorage.setItem('skillswap_user', JSON.stringify(data.user));
    }
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('skillswap_token');
    localStorage.removeItem('skillswap_user');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('skillswap_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
