import React from 'react';
import { useState, useEffect } from 'react';
import { BarChart3, Users, AlertTriangle, FileText, Shield, TrendingUp, Clock, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AdminNavbar from '../components/layout/AdminNavbar';
import useWebSocket from '../hooks/useWebSocket';
import RealTimeIncidents from '../components/admin/RealTimeIncidents';
import LiveTouristMonitor from '../components/admin/LiveTouristMonitor';
import SystemAlerts from '../components/admin/SystemAlerts';

/**
 * Admin Dashboard Page
 * Main dashboard for administrative users with real-time data
 */

const AdminDashboard = () => {
  const { user } = useAuth();
  const {
    isConnected,
    subscribe,
    sendAlert,
    sendEmergencyBroadcast,
    updateIncident
  } = useWebSocket();

  const [realTimeData, setRealTimeData] = useState({
    tourists: [],
    incidents: [],
    systemAlerts: [],
    stats: {
      activeTourists: 0,
      activeIncidents: 0,
      reportsToday: 0,
      safetyScore: 94
    }
  });

  const [connectionStatus, setConnectionStatus] = useState('connecting');

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribers = [];

    // Auth success - initial data load
    unsubscribers.push(subscribe('auth_success', (data) => {
      if (data.role === 'admin' && data.data) {
        setRealTimeData(data.data);
        setConnectionStatus('connected');
      }
    }));

    // Stats updates
    unsubscribers.push(subscribe('stats_update', (data) => {
      setRealTimeData(prev => ({
        ...prev,
        stats: data.stats
      }));
    }));

    // New incidents
    unsubscribers.push(subscribe('new_incident', (data) => {
      setRealTimeData(prev => ({
        ...prev,
        incidents: [data.incident, ...prev.incidents]
      }));
    }));

    // Incident updates
    unsubscribers.push(subscribe('incident_updated', (data) => {
      setRealTimeData(prev => ({
        ...prev,
        incidents: prev.incidents.map(incident =>
          incident.id === data.incident.id ? data.incident : incident
        )
      }));
    }));

    // Tourist activities
    unsubscribers.push(subscribe('tourist_joined', (data) => {
      setRealTimeData(prev => ({
        ...prev,
        tourists: [...prev.tourists.filter(t => t.id !== data.tourist.id), data.tourist]
      }));
    }));

    unsubscribers.push(subscribe('tourist_activity', (data) => {
      setRealTimeData(prev => ({
        ...prev,
        tourists: prev.tourists.map(tourist =>
          tourist.id === data.touristId
            ? { ...tourist, lastActivity: { activity: data.activity, details: data.details, timestamp: data.timestamp } }
            : tourist
        )
      }));
    }));

    // Location updates
    unsubscribers.push(subscribe('location_update', (data) => {
      setRealTimeData(prev => ({
        ...prev,
        tourists: prev.tourists.map(tourist =>
          tourist.id === data.touristId
            ? { ...tourist, location: data.location }
            : tourist
        )
      }));
    }));

    // System alerts
    unsubscribers.push(subscribe('system_alert', (data) => {
      setRealTimeData(prev => ({
        ...prev,
        systemAlerts: [data.alert, ...prev.systemAlerts.slice(0, 49)]
      }));
    }));

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [subscribe]);

  // Update connection status based on WebSocket state
  useEffect(() => {
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
  }, [isConnected]);

  const stats = [
    {
      icon: Users,
      title: 'Active Users',
      value: realTimeData.stats.activeTourists.toString(),
      change: '+12%',
      changeType: 'increase',
      color: 'bg-blue-500'
    },
    {
      icon: AlertTriangle,
      title: 'Active Incidents',
      value: realTimeData.stats.activeIncidents.toString(),
      change: realTimeData.stats.activeIncidents > 10 ? '+15%' : '-5%',
      changeType: realTimeData.stats.activeIncidents > 10 ? 'increase' : 'decrease',
      color: 'bg-red-500'
    },
    {
      icon: FileText,
      title: 'Reports Today',
      value: realTimeData.stats.reportsToday.toString(),
      change: '+8%',
      changeType: 'increase',
      color: 'bg-yellow-500'
    },
    {
      icon: Shield,
      title: 'Safety Score',
      value: `${realTimeData.stats.safetyScore}%`,
      change: '+2%',
      changeType: 'increase',
      color: 'bg-green-500'
    }
  ];

  const handleSendAlert = (type, message) => {
    sendAlert(type, message);
  };

  const handleEmergencyBroadcast = (message) => {
    sendEmergencyBroadcast(message);
  };

  const handleIncidentUpdate = (incidentId, updates) => {
    updateIncident(incidentId, updates);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.username}. Here's what's happening with tourist safety today.</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {connectionStatus === 'connected' ? 'Live Data' : 'Disconnected'}
            </span>
          </div>
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
          <RealTimeIncidents 
            incidents={realTimeData.incidents.slice(0, 5)}
            onUpdateIncident={handleIncidentUpdate}
          />

          {/* System Alerts */}
          <SystemAlerts 
            alerts={realTimeData.systemAlerts.slice(0, 5)}
            onSendAlert={handleSendAlert}
            onEmergencyBroadcast={handleEmergencyBroadcast}
          />
        </div>

        {/* Live Tourist Monitor */}
        <div className="mb-8">
          <LiveTouristMonitor tourists={realTimeData.tourists} />
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