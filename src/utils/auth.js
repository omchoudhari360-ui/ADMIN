/**
 * Authentication utility functions for Tourist Safety application
 * Handles localStorage operations, ID generation, and session management
 */

import { registerTourist, updateTouristLastLogin } from '../services/api';

// Generate a cryptographically secure 24-digit blockchain ID
export const generateBlockchainId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Tourist authentication functions
export const authenticateTourist = async (username, password) => {
  try {
    // Check if tourist already exists in localStorage
    let blockchainId = localStorage.getItem('touristBlockchainId');
    let existingAuth = localStorage.getItem('touristAuth');
    
    if (existingAuth) {
      const authData = JSON.parse(existingAuth);
      if (authData.username === username && authData.blockchainId) {
        // Update last login
        await updateTouristLastLogin(authData.blockchainId);
        
        // Update auth data
        const updatedAuthData = {
          ...authData,
          isLoggedIn: true,
          loginTimestamp: new Date().toISOString()
        };
        
        localStorage.setItem('touristAuth', JSON.stringify(updatedAuthData));
        return { success: true, data: updatedAuthData };
      }
    }
    
    // Register new tourist or get existing one
    const registrationResult = await registerTourist({
      username,
      password // In real implementation, this would be hashed
    });
    
    if (!registrationResult.success) {
      return { success: false, error: registrationResult.error };
    }
    
    const tourist = registrationResult.data;
    blockchainId = tourist.blockchainId;

    // Set tourist authentication data
    const authData = {
      blockchainId,
      id: blockchainId,
      userRole: 'tourist',
      username,
      email: tourist.email,
      isLoggedIn: true,
      loginTimestamp: new Date().toISOString(),
      registeredAt: tourist.registeredAt
    };

    // Store blockchain ID separately for quick access
    localStorage.setItem('touristBlockchainId', blockchainId);
    localStorage.setItem('touristAuth', JSON.stringify(authData));
    
    return { success: true, data: authData };
  } catch (error) {
    console.error('Tourist authentication error:', error);
    return { success: false, error: 'Authentication failed. Please try again.' };
  }
};

// Admin authentication functions
export const authenticateAdmin = (username, password) => {
  try {
    // Validate admin credentials
    if (username !== 'admin' || password !== 'secure123') {
      return { success: false, error: 'Invalid admin credentials' };
    }

    // Set admin authentication data
    const authData = {
      adminAuth: true,
      userRole: 'admin',
      username,
      isLoggedIn: true,
      loginTimestamp: new Date().toISOString()
    };

    localStorage.setItem('adminAuth', JSON.stringify(authData));
    return { success: true, data: authData };
  } catch (error) {
    console.error('Admin authentication error:', error);
    return { success: false, error: 'Authentication failed. Please try again.' };
  }
};

// Check current authentication status
export const getAuthStatus = () => {
  try {
    const touristAuth = localStorage.getItem('touristAuth');
    const adminAuth = localStorage.getItem('adminAuth');

    if (adminAuth) {
      const adminData = JSON.parse(adminAuth);
      if (adminData.isLoggedIn && adminData.adminAuth) {
        return { isAuthenticated: true, user: adminData, role: 'admin' };
      }
    }

    if (touristAuth) {
      const touristData = JSON.parse(touristAuth);
      if (touristData.isLoggedIn && touristData.blockchainId) {
        return { isAuthenticated: true, user: touristData, role: 'tourist' };
      }
    }

    return { isAuthenticated: false, user: null, role: null };
  } catch (error) {
    console.error('Auth status check error:', error);
    return { isAuthenticated: false, user: null, role: null };
  }
};

// Logout functions
export const logoutTourist = () => {
  try {
    localStorage.removeItem('touristAuth');
    return { success: true };
  } catch (error) {
    console.error('Tourist logout error:', error);
    return { success: false, error: 'Logout failed' };
  }
};

export const logoutAdmin = () => {
  try {
    localStorage.removeItem('adminAuth');
    return { success: true };
  } catch (error) {
    console.error('Admin logout error:', error);
    return { success: false, error: 'Logout failed' };
  }
};

// Clear all authentication data
export const clearAllAuth = () => {
  try {
    localStorage.removeItem('touristAuth');
    localStorage.removeItem('adminAuth');
    return { success: true };
  } catch (error) {
    console.error('Clear auth error:', error);
    return { success: false, error: 'Failed to clear authentication data' };
  }
};

// Validate session (check if not expired)
export const validateSession = (user) => {
  try {
    const loginTime = new Date(user.loginTimestamp);
    const now = new Date();
    const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
    
    // Session expires after 24 hours
    return hoursDiff < 24;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
};