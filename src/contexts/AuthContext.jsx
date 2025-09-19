import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuthStatus, validateSession } from '../utils/auth';

/**
 * Authentication Context Provider
 * Manages global authentication state for the Tourist Safety application
 */

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    role: null,
    loading: true
  });

  // Check authentication status on mount and localStorage changes
  const checkAuthStatus = () => {
    try {
      const status = getAuthStatus();
      
      if (status.isAuthenticated && status.user) {
        // Validate session
        if (validateSession(status.user)) {
          setAuthState({
            isAuthenticated: true,
            user: status.user,
            role: status.role,
            loading: false
          });
        } else {
          // Session expired, clear auth
          logout();
        }
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          role: null,
          loading: false
        });
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        role: null,
        loading: false
      });
    }
  };

  useEffect(() => {
    checkAuthStatus();

    // Listen for localStorage changes (for multi-tab support)
    const handleStorageChange = (e) => {
      if (e.key === 'touristAuth' || e.key === 'adminAuth') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (userData, role) => {
    setAuthState({
      isAuthenticated: true,
      user: userData,
      role: role,
      loading: false
    });
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      role: null,
      loading: false
    });
  };

  const value = {
    ...authState,
    login,
    logout,
    refreshAuth: checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};