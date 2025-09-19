import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Protected Route Component
 * Handles route protection based on authentication status and user roles
 */

const ProtectedRoute = ({ children, requiredRole = null, adminOnly = false, touristOnly = false }) => {
  const { isAuthenticated, user, role, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access control
  if (adminOnly && role !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  if (touristOnly && role !== 'tourist') {
    return <Navigate to="/admin" replace />;
  }

  // Check for specific required role
  if (requiredRole && role !== requiredRole) {
    const redirectPath = role === 'admin' ? '/admin' : '/home';
    return <Navigate to={redirectPath} replace />;
  }

  // Additional validation for admin routes
  if (location.pathname.startsWith('/admin') && role !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  // Additional validation for tourist routes
  const touristRoutes = ['/home', '/profile', '/trip', '/sos', '/report', '/tracking', '/dashboard'];
  if (touristRoutes.some(route => location.pathname.startsWith(route)) && role !== 'tourist') {
    return <Navigate to="/admin" replace />;
  }

  // Validate admin authentication specifically
  if (role === 'admin' && !user?.adminAuth) {
    return <Navigate to="/login" replace />;
  }

  // Validate tourist authentication specifically
  if (role === 'tourist' && !user?.blockchainId) {
    return <Navigate to="/login" replace />;
  }

  // All checks passed, render the protected component
  return children;
};

// Convenience components for specific route types
export const AdminRoute = ({ children }) => (
  <ProtectedRoute adminOnly={true}>
    {children}
  </ProtectedRoute>
);

export const TouristRoute = ({ children }) => (
  <ProtectedRoute touristOnly={true}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;