import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, MapPin, AlertTriangle, FileText, Activity, Phone, Calendar, Star, Bell, Megaphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TouristNavbar from '../components/layout/TouristNavbar';
import useWebSocket from '../hooks/useWebSocket';
import { createSOSAlert, createReport, createGeofenceAlert } from '../services/api';
import BlockchainIdBadge from '../components/common/BlockchainIdBadge';

/**
 * Tourist Home Page
 * Dashboard and welcome page for tourist users with real-time features
 */

const TouristHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    isConnected,
    subscribe,
    reportActivity,
    createIncident,
    updateLocation
  } = useWebSocket();

  const [notifications, setNotifications] = useState([]);
  const [emergencyAlert, setEmergencyAlert] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!isConnected) {
      console.log('WebSocket not connected, waiting...');
      return;
    }

    const unsubscribers = [];

    // System alerts
    unsubscribers.push(subscribe('system_alert', (data) => {
      setNotifications(prev => [data.alert, ...prev.slice(0, 4)]);
    }));

    // Emergency broadcasts
    unsubscribers.push(subscribe('emergency_broadcast', (data) => {
      setEmergencyAlert(data);
    }));

    // Incident confirmations
    unsubscribers.push(subscribe('incident_created', (data) => {
      setRecentActivity(prev => [
        {
          type: 'incident_reported',
          description: `Incident reported: ${data.incident.type}`,
          timestamp: new Date().toISOString()
        },
        ...prev.slice(0, 4)
      ]);
    }));

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [subscribe]);

  // Report page visit activity
  useEffect(() => {
    if (isConnected) {
      reportActivity('page_visit', { page: 'home' });
    }
  }, [isConnected, reportActivity]);

  // Simulate location updates
  useEffect(() => {
    if (isConnected && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          updateLocation(
            position.coords.latitude,
            position.coords.longitude,
            position.coords.accuracy
          );
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Simulate location for demo
          const lat = 40.7128 + (Math.random() - 0.5) * 0.01;
          const lng = -74.0060 + (Math.random() - 0.5) * 0.01;
          updateLocation(lat, lng, 10);
        },
        { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [isConnected, updateLocation]);

  const handleQuickIncident = (type) => {
    const incidentData = {
      blockchainId: user?.blockchainId,
      touristUsername: user?.username,
      type: type,
      description: `Quick report: ${type}`,
      severity: 'Medium',
      location: 'Current Location'
    };
    
    // Create both WebSocket incident and API report
    createIncident(incidentData);
    createReport(incidentData);
  };

  const handleSOSAlert = async () => {
    try {
      const sosData = {
        blockchainId: user?.blockchainId,
        touristUsername: user?.username,
        message: 'Emergency SOS Alert triggered',
        location: 'Current Location',
        coordinates: null // Would be actual coordinates in real implementation
      };
      
      await createSOSAlert(sosData);
      reportActivity('sos_triggered', { urgency: 'critical' });
      navigate('/sos');
    } catch (error) {
      console.error('Error creating SOS alert:', error);
      navigate('/sos');
    }
  };

  const handleGeofenceWarning = async (zoneName, alertType = 'WARNING') => {
    try {
      const geofenceData = {
        blockchainId: user?.blockchainId,
        touristUsername: user?.username,
        zoneName,
        alertType,
        message: `Entered ${alertType.toLowerCase()} zone: ${zoneName}`,
        location: 'Current Location',
        coordinates: null
      };
      
      await createGeofenceAlert(geofenceData);
    } catch (error) {
      console.error('Error creating geofence alert:', error);
    }
  };

  // Simulate geofence warnings for demo
  useEffect(() => {
    const simulateGeofence = () => {
      const zones = [
        { name: 'Construction Zone', type: 'WARNING' },
        { name: 'Restricted Area', type: 'DANGER' },
        { name: 'Tourist Advisory Zone', type: 'WARNING' }
      ];
      
      if (Math.random() < 0.1) { // 10% chance
        const zone = zones[Math.floor(Math.random() * zones.length)];
        handleGeofenceWarning(zone.name, zone.type);
      }
    };

    const interval = setInterval(simulateGeofence, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [user]);

  const quickActions = [
    {
      icon: AlertTriangle,
      title: 'Emergency SOS',
      description: 'Quick access to emergency services',
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
      path: '/sos',
      onClick: handleSOSAlert
    },
    {
      icon: MapPin,
      title: 'Plan Trip',
      description: 'Plan safe travel routes',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      path: '/trip',
      onClick: () => {
        reportActivity('trip_planning', { feature: 'route_planning' });
        navigate('/trip');
      }
    },
    {
      icon: FileText,
      title: 'Report Incident',
      description: 'Report safety concerns',
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
      path: '/report',
      onClick: () => {
        reportActivity('incident_reporting', { type: 'safety_concern' });
        navigate('/report');
      }
    },
    {
      icon: Activity,
      title: 'Track Location',
      description: 'Real-time location tracking',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      path: '/tracking',
      onClick: () => {
        reportActivity('location_tracking', { feature: 'real_time' });
        navigate('/tracking');
      }
    }
  ];

  const dismissEmergencyAlert = () => {
    setEmergencyAlert(null);
  };
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
      
      {/* Emergency Alert Banner */}
      {emergencyAlert && (
        <div className="bg-red-600 text-white p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <Megaphone className="w-6 h-6 mr-3" />
              <div>
                <p className="font-semibold">EMERGENCY BROADCAST</p>
                <p>{emergencyAlert.message}</p>
              </div>
            </div>
            <button
              onClick={dismissEmergencyAlert}
              className="text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white mb-8 relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.username}!</h1>
              <p className="text-blue-100 mb-4">Your safety is our priority. Stay protected during your travels.</p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  <BlockchainIdBadge blockchainId={user?.blockchainId} size="sm" />
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Member since {user?.registeredAt ? new Date(user.registeredAt).toLocaleDateString() : new Date(user?.loginTimestamp).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-300' : 'bg-red-300'}`}></div>
                  <span>{isConnected ? 'Connected' : 'Offline'}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 md:mt-0">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10" />
              </div>
            </div>
          </div>
          
          {/* Notifications */}
          {notifications.length > 0 && (
            <div className="absolute top-4 right-4">
              <div className="relative">
                <Bell className="w-6 h-6 text-white" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h2>
            <div className="space-y-2">
              {notifications.slice(0, 3).map((notification, index) => (
                <div key={notification.id} className={`p-3 rounded-lg border-l-4 ${
                  notification.type === 'warning' 
                    ? 'border-yellow-400 bg-yellow-50'
                    : notification.type === 'error'
                    ? 'border-red-400 bg-red-50'
                    : 'border-blue-400 bg-blue-50'
                }`}>
                  <p className="text-sm font-medium">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick || (() => navigate(action.path))}
              className={`${action.color} ${action.hoverColor} text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200`}
            >
              <action.icon className="w-8 h-8 mb-4" />
              <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
              <p className="text-sm opacity-90">{action.description}</p>
            </button>
          ))}
        </div>

        {/* Quick Incident Reporting */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Incident Report</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Safety Concern', 'Medical Emergency', 'Lost Tourist', 'Theft Report'].map((type) => (
              <button
                key={type}
                onClick={() => handleQuickIncident(type)}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <AlertTriangle className="w-5 h-5 text-yellow-500 mb-2" />
                <p className="text-sm font-medium text-gray-900">{type}</p>
              </button>
            ))}
          </div>
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
          {recentActivity.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity to display.</p>
              <p className="text-sm">Start using safety features to see your activity here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-500 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TouristHome;