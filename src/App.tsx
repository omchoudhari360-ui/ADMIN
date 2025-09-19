import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute, { AdminRoute, TouristRoute } from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import TouristHome from './pages/TouristHome';
import AdminDashboard from './pages/AdminDashboard';
import TouristProfile from './pages/TouristProfile';
import TouristTripPlanning from './pages/TouristTripPlanning';
import TouristSOS from './pages/TouristSOS';
import TouristReport from './pages/TouristReport';
import TouristTracking from './pages/TouristTracking';
import AdminUsers from './pages/AdminUsers';
import AdminIncidents from './pages/AdminIncidents';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';

/**
 * Main App Component
 * Handles routing and authentication flow for Tourist Safety application
 */

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Tourist Routes */}
            <Route path="/home" element={
              <TouristRoute>
                <TouristHome />
              </TouristRoute>
            } />
            
            <Route path="/profile" element={
              <TouristRoute>
                <TouristProfile />
              </TouristRoute>
            } />
            
            <Route path="/trip" element={
              <TouristRoute>
                <TouristTripPlanning />
              </TouristRoute>
            } />
            
            <Route path="/sos" element={
              <TouristRoute>
                <TouristSOS />
              </TouristRoute>
            } />
            
            <Route path="/report" element={
              <TouristRoute>
                <TouristReport />
              </TouristRoute>
            } />
            
            <Route path="/tracking" element={
              <TouristRoute>
                <TouristTracking />
              </TouristRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            
            <Route path="/admin/users" element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            } />
            
            <Route path="/admin/incidents" element={
              <AdminRoute>
                <AdminIncidents />
              </AdminRoute>
            } />
            
            <Route path="/admin/reports" element={
              <AdminRoute>
                <AdminReports />
              </AdminRoute>
            } />
            
            <Route path="/admin/settings" element={
              <AdminRoute>
                <AdminSettings />
              </AdminRoute>
            } />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Catch-all route */}
            <Route path="*" element={
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
                  <p className="text-gray-600 mb-4">Page not found</p>
                  <button 
                    onClick={() => window.history.back()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;