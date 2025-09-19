import React from 'react';
import { BarChart3, Users, AlertTriangle, FileText, Shield, TrendingUp, Clock, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AdminNavbar from '../components/layout/AdminNavbar';

/**
 * Admin Dashboard Page
 * Main dashboard for administrative users
 */

const AdminDashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      icon: Users,
      title: 'Active Users',
      value: '1,234',
      change: '+12%',
      changeType: 'increase',
      color: 'bg-blue-500'
    },
    {
      icon: AlertTriangle,
      title: 'Active Incidents',
      value: '23',
      change: '-5%',
      changeType: 'decrease',
      color: 'bg-red-500'
    },
    {
      icon: FileText,
      title: 'Reports Today',
      value: '87',
      change: '+8%',
      changeType: 'increase',
      color: 'bg-yellow-500'
    },
    {
      icon: Shield,
      title: 'Safety Score',
      value: '94%',
      change: '+2%',
      changeType: 'increase',
      color: 'bg-green-500'
    }
  ];

  const recentIncidents = [
    {
      id: 1,
      type: 'Medical Emergency',
      location: 'Downtown Plaza',
      time: '2 hours ago',
      status: 'Resolved',
      severity: 'High'
    },
    {
      id: 2,
      type: 'Safety Concern',
      location: 'Tourist District',
      time: '4 hours ago',
      status: 'In Progress',
      severity: 'Medium'
    },
    {
      id: 3,
      type: 'Lost Tourist',
      location: 'Central Park',
      time: '6 hours ago',
      status: 'Resolved',
      severity: 'Low'
    }
  ];

  const systemAlerts = [
    {
      type: 'warning',
      message: 'High traffic detected in tourist zones',
      time: '10 minutes ago'
    },
    {
      type: 'info',
      message: 'System maintenance scheduled for tonight',
      time: '1 hour ago'
    },
    {
      type: 'success',
      message: 'Security updates successfully deployed',
      time: '3 hours ago'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.username}. Here's what's happening with tourist safety today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className={`w-4 h-4 mr-1 ${stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-sm font-medium ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
                <span className="text-gray-500 text-sm ml-1">from last month</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Incidents */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Incidents</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentIncidents.map((incident) => (
                <div key={incident.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{incident.type}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      incident.status === 'Resolved' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {incident.status}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 space-x-4">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {incident.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {incident.time}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      incident.severity === 'High' 
                        ? 'bg-red-100 text-red-700'
                        : incident.severity === 'Medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {incident.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">System Alerts</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Manage
              </button>
            </div>
            <div className="space-y-4">
              {systemAlerts.map((alert, index) => (
                <div key={index} className={`border-l-4 p-4 rounded ${
                  alert.type === 'warning' 
                    ? 'border-yellow-400 bg-yellow-50'
                    : alert.type === 'info'
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-green-400 bg-green-50'
                }`}>
                  <p className={`font-medium ${
                    alert.type === 'warning' 
                      ? 'text-yellow-800'
                      : alert.type === 'info'
                      ? 'text-blue-800'
                      : 'text-green-800'
                  }`}>
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{alert.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Users className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-600">View and manage tourist accounts</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <AlertTriangle className="w-6 h-6 text-red-600 mb-2" />
              <h3 className="font-medium text-gray-900">Emergency Response</h3>
              <p className="text-sm text-gray-600">Handle active emergencies</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <BarChart3 className="w-6 h-6 text-green-600 mb-2" />
              <h3 className="font-medium text-gray-900">View Reports</h3>
              <p className="text-sm text-gray-600">Analyze safety metrics</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;