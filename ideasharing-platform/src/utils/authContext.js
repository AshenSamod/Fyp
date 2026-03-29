import React, { createContext, useContext, useState, useEffect } from 'react';
import tokenManager from './tokenManager';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state from localStorage
    const initializeAuth = () => {
      if (tokenManager.isAuthenticated()) {
        const userData = tokenManager.getUser();
        setUser(userData);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (accessToken, refreshToken, userData) => {
    tokenManager.saveTokens(accessToken, refreshToken, userData);
    setUser(userData);
  };

  const logout = () => {
    tokenManager.clearTokens();
    setUser(null);
  };

  const updateUser = (userData) => {
    tokenManager.saveTokens(null, null, userData);
    setUser(userData);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
