import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute, { AdminRoute, TouristRoute } from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import TouristHome from './pages/TouristHome';
import AdminDashboard from './pages/AdminDashboard';
import TouristProfile from './pages/TouristProfile';

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
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Trip Planning</h1>
                    <p className="text-gray-600">Trip planning features coming soon...</p>
                  </div>
                </div>
              </TouristRoute>
            } />
            
            <Route path="/sos" element={
              <TouristRoute>
                <div className="min-h-screen bg-red-50 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-900 mb-2">Emergency SOS</h1>
                    <p className="text-red-700">Emergency services interface coming soon...</p>
                    <button className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                      Call Emergency Services
                    </button>
                  </div>
                </div>
              </TouristRoute>
            } />
            
            <Route path="/report" element={
              <TouristRoute>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Incident</h1>
                    <p className="text-gray-600">Incident reporting system coming soon...</p>
                  </div>
                </div>
              </TouristRoute>
            } />
            
            <Route path="/tracking" element={
              <TouristRoute>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Location Tracking</h1>
                    <p className="text-gray-600">Real-time tracking features coming soon...</p>
                  </div>
                </div>
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
                <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">User Management</h1>
                    <p className="text-gray-600">User management interface coming soon...</p>
                  </div>
                </div>
              </AdminRoute>
            } />
            
            <Route path="/admin/incidents" element={
              <AdminRoute>
                <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Incident Management</h1>
                    <p className="text-gray-600">Incident management system coming soon...</p>
                  </div>
                </div>
              </AdminRoute>
            } />
            
            <Route path="/admin/reports" element={
              <AdminRoute>
                <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
                    <p className="text-gray-600">Reporting dashboard coming soon...</p>
                  </div>
                </div>
              </AdminRoute>
            } />
            
            <Route path="/admin/settings" element={
              <AdminRoute>
                <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">System Settings</h1>
                    <p className="text-gray-600">Admin settings panel coming soon...</p>
                  </div>
                </div>
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