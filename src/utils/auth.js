/**
 * Authentication utility functions for Tourist Safety application
 * Handles localStorage operations, ID generation, and session management
 */

// Generate a cryptographically secure 24-digit blockchain ID
export const generateBlockchainId = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString().slice(2);
  const combined = (timestamp + random).slice(0, 24);
  
  // Ensure exactly 24 digits
  return combined.padEnd(24, '0');
};

// Tourist authentication functions
export const authenticateTourist = (username, password) => {
  try {
    // Generate or retrieve blockchain ID
    let blockchainId = localStorage.getItem('touristBlockchainId');
    if (!blockchainId) {
      blockchainId = generateBlockchainId();
      localStorage.setItem('touristBlockchainId', blockchainId);
    }

    // Set tourist authentication data
    const authData = {
      blockchainId,
      userRole: 'tourist',
      username,
      isLoggedIn: true,
      loginTimestamp: new Date().toISOString()
    };

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