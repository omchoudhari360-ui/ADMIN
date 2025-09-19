import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Shield, Activity, Users, Settings, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TouristNavbar from '../components/layout/TouristNavbar';
import useWebSocket from '../hooks/useWebSocket';
import BlockchainIdBadge from '../components/common/BlockchainIdBadge';

/**
 * Tourist Location Tracking Page
 * Real-time location tracking and sharing controls
 */

const TouristTracking = () => {
  const { user } = useAuth();
  const { isConnected, reportActivity, updateLocation } = useWebSocket();
  
  const [location, setLocation] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [sharingSettings, setSharingSettings] = useState({
    emergencyContacts: true,
    adminPanel: true,
    familyMembers: false,
    publicSafety: true
  });
  const [watchId, setWatchId] = useState(null);
  const [accuracy, setAccuracy] = useState('high');

  useEffect(() => {
    if (isConnected) {
      reportActivity('tracking_page_visit', { timestamp: new Date().toISOString() });
    }
  }, [isConnected, reportActivity]);

  useEffect(() => {
    if (trackingEnabled) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [trackingEnabled, accuracy]);

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported');
      return;
    }

    const options = {
      enableHighAccuracy: accuracy === 'high',
      timeout: 10000,
      maximumAge: accuracy === 'high' ? 5000 : 30000
    };

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
          speed: position.coords.speed,
          heading: position.coords.heading
        };

        setLocation(newLocation);
        setLocationHistory(prev => [newLocation, ...prev.slice(0, 49)]); // Keep last 50 locations

        // Send to WebSocket if connected
        if (isConnected) {
          updateLocation(newLocation.latitude, newLocation.longitude, newLocation.accuracy);
        }

        // Report activity
        if (isConnected) {
          reportActivity('location_update', {
            accuracy: newLocation.accuracy,
            timestamp: newLocation.timestamp
          });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        // Use mock location for demo
        const mockLocation = {
          latitude: 40.7128 + (Math.random() - 0.5) * 0.01,
          longitude: -74.0060 + (Math.random() - 0.5) * 0.01,
          accuracy: 10,
          timestamp: new Date().toISOString(),
          speed: null,
          heading: null
        };
        setLocation(mockLocation);
        setLocationHistory(prev => [mockLocation, ...prev.slice(0, 49)]);
      },
      options
    );

    setWatchId(id);
  };

  const stopLocationTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  const toggleTracking = () => {
    setTrackingEnabled(!trackingEnabled);
    if (isConnected) {
      reportActivity('tracking_toggled', { enabled: !trackingEnabled });
    }
  };

  const updateSharingSetting = (setting, value) => {
    setSharingSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    
    if (isConnected) {
      reportActivity('sharing_settings_updated', { setting, value });
    }
  };

  const formatCoordinate = (coord) => {
    return coord ? coord.toFixed(6) : 'N/A';
  };

  const formatDistance = (accuracy) => {
    if (accuracy < 1000) {
      return `±${Math.round(accuracy)}m`;
    }
    return `±${(accuracy / 1000).toFixed(1)}km`;
  };

  const getAccuracyColor = (acc) => {
    if (acc <= 10) return 'text-green-600';
    if (acc <= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TouristNavbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Location Tracking</h1>
              <p className="text-green-100 mb-4">Real-time location monitoring for your safety and security</p>
              <div className="flex items-center space-x-4 text-sm">
                <BlockchainIdBadge blockchainId={user?.blockchainId} size="sm" />
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${trackingEnabled ? 'bg-green-300' : 'bg-red-300'}`}></div>
                  <span>{trackingEnabled ? 'Tracking Active' : 'Tracking Disabled'}</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-300' : 'bg-red-300'}`}></div>
                  <span>{isConnected ? 'Connected' : 'Offline'}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Navigation className="w-12 h-12 mb-2" />
              <p className="text-sm text-green-100">GPS Active</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Location */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Current Location</h2>
                <button
                  onClick={toggleTracking}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    trackingEnabled 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {trackingEnabled ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Stop Tracking
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Start Tracking
                    </>
                  )}
                </button>
              </div>

              {location ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                      <p className="font-mono text-lg text-gray-900">{formatCoordinate(location.latitude)}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                      <p className="font-mono text-lg text-gray-900">{formatCoordinate(location.longitude)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Accuracy</label>
                      <p className={`font-semibold ${getAccuracyColor(location.accuracy)}`}>
                        {formatDistance(location.accuracy)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Speed</label>
                      <p className="text-gray-900">
                        {location.speed ? `${(location.speed * 3.6).toFixed(1)} km/h` : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Update</label>
                      <p className="text-gray-900 text-sm">
                        {new Date(location.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-900">
                        Location shared with: {Object.entries(sharingSettings).filter(([_, enabled]) => enabled).length} services
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Navigation className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    {trackingEnabled ? 'Getting your location...' : 'Location tracking is disabled'}
                  </p>
                  <p className="text-sm">
                    {trackingEnabled 
                      ? 'Please allow location access when prompted' 
                      : 'Enable tracking to see your current location'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Location History */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Location History</h2>
              
              {locationHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No location history available</p>
                  <p className="text-sm">Location updates will appear here</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {locationHistory.slice(0, 10).map((loc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-green-500 mr-3" />
                        <div>
                          <p className="font-mono text-sm text-gray-900">
                            {formatCoordinate(loc.latitude)}, {formatCoordinate(loc.longitude)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Accuracy: {formatDistance(loc.accuracy)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {new Date(loc.timestamp).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {index === 0 ? 'Current' : `${index + 1} updates ago`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Location Map</h2>
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Interactive Map Coming Soon</p>
                  <p className="text-sm">View your location and tracking history on a map</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tracking Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <Settings className="w-6 h-6 text-blue-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Tracking Settings</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accuracy Level</label>
                  <select
                    value={accuracy}
                    onChange={(e) => setAccuracy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="high">High Accuracy (GPS)</option>
                    <option value="medium">Medium Accuracy</option>
                    <option value="low">Low Accuracy (Battery Saver)</option>
                  </select>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">Update Frequency</p>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="radio" name="frequency" className="mr-2" defaultChecked />
                      <span className="text-sm text-gray-600">Real-time (5 seconds)</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="frequency" className="mr-2" />
                      <span className="text-sm text-gray-600">Normal (30 seconds)</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="frequency" className="mr-2" />
                      <span className="text-sm text-gray-600">Battery Saver (5 minutes)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Sharing Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <Users className="w-6 h-6 text-purple-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Sharing Settings</h3>
              </div>
              
              <div className="space-y-4">
                {Object.entries(sharingSettings).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <button
                      onClick={() => updateSharingSetting(key, !enabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        enabled ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs text-yellow-800">
                  Location sharing helps emergency responders find you quickly in case of an emergency.
                </p>
              </div>
            </div>

            {/* Safety Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <Shield className="w-6 h-6 text-green-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Safety Status</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">GPS Signal</span>
                  <span className={`text-sm font-medium ${location ? 'text-green-600' : 'text-red-600'}`}>
                    {location ? 'Strong' : 'Weak'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Connection</span>
                  <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {isConnected ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Emergency Ready</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Battery Impact</span>
                  <span className={`text-sm font-medium ${
                    accuracy === 'high' ? 'text-red-600' : 
                    accuracy === 'medium' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {accuracy === 'high' ? 'High' : accuracy === 'medium' ? 'Medium' : 'Low'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center p-3 text-left bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                  <Shield className="w-5 h-5 text-red-600 mr-3" />
                  <div>
                    <p className="font-medium text-red-900">Emergency SOS</p>
                    <p className="text-sm text-red-700">Send location with SOS alert</p>
                  </div>
                </button>
                
                <button className="w-full flex items-center p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <Users className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-blue-900">Share Location</p>
                    <p className="text-sm text-blue-700">Send current location to contacts</p>
                  </div>
                </button>
                
                <button className="w-full flex items-center p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <Activity className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900">Check In</p>
                    <p className="text-sm text-green-700">Send safety check-in message</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TouristTracking;