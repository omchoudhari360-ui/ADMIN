import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, MapPin, AlertTriangle, FileText, Activity, Phone, Calendar, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TouristNavbar from '../components/layout/TouristNavbar';

/**
 * Tourist Home Page
 * Dashboard and welcome page for tourist users
 */

const TouristHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const quickActions = [
    {
      icon: AlertTriangle,
      title: 'Emergency SOS',
      description: 'Quick access to emergency services',
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
      path: '/sos'
    },
    {
      icon: MapPin,
      title: 'Plan Trip',
      description: 'Plan safe travel routes',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      path: '/trip'
    },
    {
      icon: FileText,
      title: 'Report Incident',
      description: 'Report safety concerns',
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
      path: '/report'
    },
    {
      icon: Activity,
      title: 'Track Location',
      description: 'Real-time location tracking',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      path: '/tracking'
    }
  ];

  const safetyTips = [
    'Always keep your emergency contacts updated',
    'Share your location with trusted contacts',
    'Keep local emergency numbers handy',
    'Stay aware of your surroundings',
    'Trust your instincts about unsafe situations'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <TouristNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.username}!</h1>
              <p className="text-blue-100 mb-4">Your safety is our priority. Stay protected during your travels.</p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  <span>Blockchain ID: {user?.blockchainId}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Member since {new Date(user?.loginTimestamp).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 md:mt-0">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className={`${action.color} ${action.hoverColor} text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200`}
            >
              <action.icon className="w-8 h-8 mb-4" />
              <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
              <p className="text-sm opacity-90">{action.description}</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Safety Tips */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-6">
              <Star className="w-6 h-6 text-yellow-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Daily Safety Tips</h2>
            </div>
            <div className="space-y-4">
              {safetyTips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <p className="text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-6">
              <Phone className="w-6 h-6 text-red-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Emergency Contacts</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-medium text-red-900 mb-2">Emergency Services</h3>
                <p className="text-2xl font-bold text-red-600">911</p>
                <p className="text-sm text-red-700">Police, Fire, Medical</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">Tourist Hotline</h3>
                <p className="text-xl font-semibold text-blue-600">1-800-TOURIST</p>
                <p className="text-sm text-blue-700">24/7 Travel Support</p>
              </div>
              <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-colors">
                + Add Personal Contact
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="text-center py-12 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity to display.</p>
            <p className="text-sm">Start using safety features to see your activity here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TouristHome;