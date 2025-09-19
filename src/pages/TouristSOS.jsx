import React, { useState, useEffect } from 'react';
import { AlertTriangle, Phone, MapPin, Clock, Shield, Siren, Users, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TouristNavbar from '../components/layout/TouristNavbar';
import useWebSocket from '../hooks/useWebSocket';
import { createSOSAlert } from '../services/api';
import BlockchainIdBadge from '../components/common/BlockchainIdBadge';

/**
 * Tourist SOS Emergency Page
 * Emergency services interface with real-time communication
 */

const TouristSOS = () => {
  const { user } = useAuth();
  const { isConnected, reportActivity, updateLocation } = useWebSocket();
  
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyType, setEmergencyType] = useState('');
  const [location, setLocation] = useState(null);
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [sosHistory, setSosHistory] = useState([]);

  const emergencyTypes = [
    { id: 'medical', name: 'Medical Emergency', icon: '🏥', color: 'bg-red-500' },
    { id: 'police', name: 'Police Required', icon: '👮', color: 'bg-blue-500' },
    { id: 'fire', name: 'Fire Emergency', icon: '🔥', color: 'bg-orange-500' },
    { id: 'personal', name: 'Personal Safety', icon: '🛡️', color: 'bg-purple-500' },
    { id: 'accident', name: 'Accident', icon: '🚗', color: 'bg-yellow-500' },
    { id: 'other', name: 'Other Emergency', icon: '⚠️', color: 'bg-gray-500' }
  ];

  const emergencyContacts = [
    { name: 'Emergency Services', number: '911', type: 'primary' },
    { name: 'Tourist Hotline', number: '1-800-TOURIST', type: 'secondary' },
    { name: 'Local Police', number: '(555) 123-4567', type: 'secondary' },
    { name: 'Medical Emergency', number: '(555) 987-6543', type: 'secondary' }
  ];

  useEffect(() => {
    if (isConnected) {
      reportActivity('sos_page_visit', { timestamp: new Date().toISOString() });
    }
  }, [isConnected, reportActivity]);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };
          setLocation(currentLocation);
          if (isConnected) {
            updateLocation(currentLocation.latitude, currentLocation.longitude, currentLocation.accuracy);
          }
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Use mock location for demo
          const mockLocation = {
            latitude: 40.7128,
            longitude: -74.0060,
            accuracy: 10,
            timestamp: new Date().toISOString()
          };
          setLocation(mockLocation);
        }
      );
    }
  }, [isConnected, updateLocation]);

  const handleEmergencyTrigger = async (type) => {
    setEmergencyActive(true);
    setEmergencyType(type);
    setCountdown(10);

    // Start countdown
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          triggerSOS(type);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const triggerSOS = async (type) => {
    try {
      const sosData = {
        blockchainId: user?.blockchainId,
        touristUsername: user?.username,
        type: emergencyTypes.find(t => t.id === type)?.name || 'Emergency',
        message: emergencyMessage || `Emergency SOS Alert: ${emergencyTypes.find(t => t.id === type)?.name}`,
        location: location ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : 'Location unavailable',
        coordinates: location ? { lat: location.latitude, lng: location.longitude } : null,
        severity: 'CRITICAL'
      };

      const result = await createSOSAlert(sosData);
      
      if (result.success) {
        setSosHistory(prev => [result.data, ...prev]);
        if (isConnected) {
          reportActivity('sos_triggered', { 
            type: type, 
            urgency: 'critical',
            location: sosData.location 
          });
        }
      }
    } catch (error) {
      console.error('Error creating SOS alert:', error);
    }
  };

  const cancelEmergency = () => {
    setEmergencyActive(false);
    setEmergencyType('');
    setCountdown(0);
    setEmergencyMessage('');
  };

  const callEmergencyNumber = (number) => {
    // In a real app, this would initiate a phone call
    window.open(`tel:${number}`);
    if (isConnected) {
      reportActivity('emergency_call', { number: number });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TouristNavbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Emergency Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Emergency SOS</h1>
              <p className="text-red-100 mb-4">Quick access to emergency services and safety assistance</p>
              <div className="flex items-center space-x-4 text-sm">
                <BlockchainIdBadge blockchainId={user?.blockchainId} size="sm" />
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{location ? 'Location Available' : 'Getting Location...'}</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-300' : 'bg-red-300'}`}></div>
                  <span>{isConnected ? 'Connected' : 'Offline'}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Siren className="w-12 h-12 mb-2" />
              <p className="text-sm text-red-100">Emergency Ready</p>
            </div>
          </div>
        </div>

        {/* Active Emergency */}
        {emergencyActive && (
          <div className="bg-red-600 text-white rounded-xl p-6 mb-8 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 mr-4" />
                <div>
                  <h2 className="text-xl font-bold">EMERGENCY ACTIVE</h2>
                  <p>SOS Alert will be sent in {countdown} seconds</p>
                  <p className="text-sm">Type: {emergencyTypes.find(t => t.id === emergencyType)?.name}</p>
                </div>
              </div>
              <button
                onClick={cancelEmergency}
                className="px-6 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100"
              >
                CANCEL
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Emergency Types */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Emergency Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emergencyTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleEmergencyTrigger(type.id)}
                    disabled={emergencyActive}
                    className={`${type.color} text-white p-6 rounded-xl hover:opacity-90 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <h3 className="font-semibold text-lg">{type.name}</h3>
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency Message */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
              <textarea
                value={emergencyMessage}
                onChange={(e) => setEmergencyMessage(e.target.value)}
                placeholder="Describe your emergency situation (optional)..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-2">
                This information will be sent with your SOS alert to help emergency responders.
              </p>
            </div>

            {/* SOS History */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent SOS Alerts</h2>
              {sosHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No SOS alerts sent</p>
                  <p className="text-sm">Your emergency alerts will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sosHistory.map((alert) => (
                    <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{alert.type}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alert.status === 'active' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {alert.status?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        <MapPin className="w-4 h-4 ml-4 mr-1" />
                        <span>{alert.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Emergency Contacts */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <Phone className="w-6 h-6 text-red-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Emergency Contacts</h3>
              </div>
              <div className="space-y-3">
                {emergencyContacts.map((contact, index) => (
                  <button
                    key={index}
                    onClick={() => callEmergencyNumber(contact.number)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      contact.type === 'primary' 
                        ? 'border-red-500 bg-red-50 hover:bg-red-100' 
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${
                          contact.type === 'primary' ? 'text-red-900' : 'text-gray-900'
                        }`}>
                          {contact.name}
                        </p>
                        <p className={`text-lg font-bold ${
                          contact.type === 'primary' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {contact.number}
                        </p>
                      </div>
                      <Phone className={`w-5 h-5 ${
                        contact.type === 'primary' ? 'text-red-500' : 'text-gray-400'
                      }`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Location */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <MapPin className="w-6 h-6 text-blue-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Current Location</h3>
              </div>
              {location ? (
                <div className="space-y-2">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-medium text-gray-700">Coordinates</p>
                    <p className="font-mono text-sm text-gray-900">
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-medium text-gray-700">Accuracy</p>
                    <p className="text-sm text-gray-900">±{location.accuracy}m</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Location updated: {new Date(location.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm">Getting your location...</p>
                </div>
              )}
            </div>

            {/* Safety Tips */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <Shield className="w-6 h-6 text-green-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Emergency Tips</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Stay calm and provide clear information</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Share your exact location if possible</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Follow emergency responder instructions</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Keep your phone charged and accessible</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <Users className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-blue-900">Contact Family</p>
                    <p className="text-sm text-blue-700">Notify emergency contacts</p>
                  </div>
                </button>
                
                <button className="w-full flex items-center p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <MessageCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900">Send Location</p>
                    <p className="text-sm text-green-700">Share current location</p>
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

export default TouristSOS;