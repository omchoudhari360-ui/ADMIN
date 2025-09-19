import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, User, Shield, Loader2 } from 'lucide-react';
import { authenticateTourist, authenticateAdmin } from '../../utils/auth';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Unified Login Component
 * Handles authentication for both Tourist and Admin users
 */

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'tourist'
  });
  
  const [uiState, setUiState] = useState({
    showPassword: false,
    isLoading: false,
    error: '',
    success: ''
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/home';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user types
    if (uiState.error) {
      setUiState(prev => ({ ...prev, error: '' }));
    }
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({
      ...prev,
      role,
      username: '', // Clear form when switching roles
      password: ''
    }));
    setUiState(prev => ({ ...prev, error: '', success: '' }));
  };

  const togglePasswordVisibility = () => {
    setUiState(prev => ({
      ...prev,
      showPassword: !prev.showPassword
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      setUiState(prev => ({
        ...prev,
        error: 'Please fill in all fields'
      }));
      return;
    }

    setUiState(prev => ({
      ...prev,
      isLoading: true,
      error: '',
      success: ''
    }));

    try {
      let result;
      
      if (formData.role === 'tourist') {
        result = authenticateTourist(formData.username, formData.password);
      } else {
        result = authenticateAdmin(formData.username, formData.password);
      }

      if (result.success) {
        setUiState(prev => ({
          ...prev,
          success: `Welcome, ${formData.role}!`,
          isLoading: false
        }));
        
        // Update auth context
        login(result.data, formData.role);
        
        // Navigate to appropriate page
        const from = location.state?.from?.pathname;
        let redirectPath = '/home';
        
        if (formData.role === 'admin') {
          redirectPath = from && from.startsWith('/admin') ? from : '/admin';
        } else {
          redirectPath = from && !from.startsWith('/admin') ? from : '/home';
        }
        
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 1000);
        
      } else {
        setUiState(prev => ({
          ...prev,
          error: result.error,
          isLoading: false
        }));
        
        // Clear password on failed admin login
        if (formData.role === 'admin') {
          setFormData(prev => ({ ...prev, password: '' }));
        }
      }
    } catch (error) {
      setUiState(prev => ({
        ...prev,
        error: 'An unexpected error occurred. Please try again.',
        isLoading: false
      }));
    }
  };

  const roleStyles = {
    tourist: {
      accent: 'bg-blue-600 hover:bg-blue-700',
      border: 'border-blue-500',
      text: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    admin: {
      accent: 'bg-gray-800 hover:bg-gray-900',
      border: 'border-gray-500',
      text: 'text-gray-800',
      bg: 'bg-gray-50'
    }
  };

  const currentStyle = roleStyles[formData.role];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tourist Safety</h1>
          <p className="text-gray-600">Secure access to safety services</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {/* Role Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select User Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleChange('tourist')}
                className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                  formData.role === 'tourist'
                    ? `${currentStyle.accent} text-white border-transparent`
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <User className="w-4 h-4 mr-2" />
                Tourist
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                  formData.role === 'admin'
                    ? `${currentStyle.accent} text-white border-transparent`
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder={formData.role === 'admin' ? 'Enter admin username' : 'Enter your username'}
                disabled={uiState.isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={uiState.showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder={formData.role === 'admin' ? 'Enter admin password' : 'Enter your password'}
                  disabled={uiState.isLoading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  disabled={uiState.isLoading}
                >
                  {uiState.showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Display */}
            {uiState.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{uiState.error}</p>
              </div>
            )}

            {/* Success Display */}
            {uiState.success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{uiState.success}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uiState.isLoading}
              className={`w-full flex items-center justify-center px-4 py-3 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${currentStyle.accent}`}
            >
              {uiState.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Helper Text */}
          <div className="mt-6 text-center">
            <div className={`text-xs p-3 rounded-lg ${currentStyle.bg}`}>
              {formData.role === 'tourist' ? (
                <p className={`${currentStyle.text}`}>
                  <strong>Tourist Access:</strong> Any username/password combination is accepted. 
                  A unique Blockchain ID will be generated for your safety tracking.
                </p>
              ) : (
                <p className={`${currentStyle.text}`}>
                  <strong>Admin Access:</strong> Use credentials - Username: <code>admin</code>, Password: <code>secure123</code>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;