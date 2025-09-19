import React, { useState, useEffect } from 'react';
import { MapPin, Route, Clock, AlertTriangle, Star, Navigation, Plus, Save, X, Map } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TouristNavbar from '../components/layout/TouristNavbar';
import useWebSocket from '../hooks/useWebSocket';
import BlockchainIdBadge from '../components/common/BlockchainIdBadge';

/**
 * Tourist Trip Planning Page
 * Plan safe travel routes with real-time safety information
 */

const TouristTripPlanning = () => {
  const { user } = useAuth();
  const { isConnected, reportActivity, updateLocation } = useWebSocket();
  
  const [trips, setTrips] = useState([]);
  const [showNewTrip, setShowNewTrip] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [newTrip, setNewTrip] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    description: '',
    safetyLevel: 'medium'
  });

  const [safetyAlerts] = useState([
    {
      id: 1,
      location: 'Downtown Area',
      type: 'Construction',
      severity: 'low',
      message: 'Road construction on Main Street, expect delays'
    },
    {
      id: 2,
      location: 'Tourist District',
      type: 'Weather Alert',
      severity: 'medium',
      message: 'Heavy rain expected this afternoon'
    },
    {
      id: 3,
      location: 'Beach Area',
      type: 'Safety Warning',
      severity: 'high',
      message: 'Strong currents reported, swimming not recommended'
    }
  ]);

  const [popularDestinations] = useState([
    { name: 'Central Park', rating: 4.8, safetyScore: 95, distance: '2.3 km' },
    { name: 'Art Museum', rating: 4.6, safetyScore: 98, distance: '1.8 km' },
    { name: 'Historic District', rating: 4.7, safetyScore: 92, distance: '3.1 km' },
    { name: 'Waterfront', rating: 4.5, safetyScore: 88, distance: '4.2 km' },
    { name: 'Shopping Center', rating: 4.4, safetyScore: 96, distance: '2.7 km' },
    { name: 'Local Market', rating: 4.3, safetyScore: 90, distance: '1.5 km' }
  ]);

  useEffect(() => {
    if (isConnected) {
      reportActivity('trip_planning', { page: 'trip_planning' });
    }
  }, [isConnected, reportActivity]);

  const handleCreateTrip = () => {
    if (newTrip.name && newTrip.destination) {
      const trip = {
        id: Date.now(),
        ...newTrip,
        createdAt: new Date().toISOString(),
        blockchainId: user?.blockchainId,
        status: 'planned'
      };
      
      setTrips(prev => [trip, ...prev]);
      setNewTrip({
        name: '',
        destination: '',
        startDate: '',
        endDate: '',
        description: '',
        safetyLevel: 'medium'
      });
      setShowNewTrip(false);
      
      if (isConnected) {
        reportActivity('trip_created', { tripName: trip.name, destination: trip.destination });
      }
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSafetyColor = (score) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TouristNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Trip Planning</h1>
              <p className="text-blue-100 mb-4">Plan safe and enjoyable trips with real-time safety information</p>
              <div className="flex items-center space-x-4 text-sm">
                <BlockchainIdBadge blockchainId={user?.blockchainId} size="sm" />
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-300' : 'bg-red-300'}`}></div>
                  <span>{isConnected ? 'Live Safety Data' : 'Offline Mode'}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <MapPin className="w-12 h-12 mb-2" />
              <p className="text-sm text-blue-100">Safe Travels</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Trips */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">My Trips</h2>
                <button
                  onClick={() => setShowNewTrip(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Trip
                </button>
              </div>

              {trips.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Route className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No trips planned yet</p>
                  <p>Create your first trip to get started with safe travel planning</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trips.map((trip) => (
                    <div key={trip.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{trip.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          trip.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                          trip.status === 'active' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {trip.status?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{trip.destination}</span>
                        <Clock className="w-4 h-4 ml-4 mr-1" />
                        <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{trip.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            trip.safetyLevel === 'high' ? 'bg-green-100 text-green-800' :
                            trip.safetyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            Safety: {trip.safetyLevel}
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedTrip(trip)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Popular Destinations */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Popular Destinations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {popularDestinations.map((destination, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{destination.name}</h3>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm text-gray-600">{destination.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{destination.distance}</span>
                      <span className={`font-medium ${getSafetyColor(destination.safetyScore)}`}>
                        Safety: {destination.safetyScore}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Route Planning */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Route Planning</h2>
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Map className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Interactive Map Coming Soon</p>
                  <p className="text-sm">Plan your routes with real-time safety data</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Safety Alerts */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Safety Alerts</h3>
              </div>
              <div className="space-y-3">
                {safetyAlerts.map((alert) => (
                  <div key={alert.id} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{alert.location}</span>
                      <span className="text-xs uppercase font-medium">{alert.severity}</span>
                    </div>
                    <p className="text-xs">{alert.type}</p>
                    <p className="text-sm mt-1">{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <Navigation className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-blue-900">Get Directions</p>
                    <p className="text-sm text-blue-700">Navigate safely to destination</p>
                  </div>
                </button>
                
                <button className="w-full flex items-center p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <MapPin className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900">Share Location</p>
                    <p className="text-sm text-green-700">Share with emergency contacts</p>
                  </div>
                </button>
                
                <button className="w-full flex items-center p-3 text-left bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="font-medium text-yellow-900">Report Issue</p>
                    <p className="text-sm text-yellow-700">Report safety concerns</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Travel Tips */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Travel Tips</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Always inform someone about your travel plans</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Keep emergency contacts easily accessible</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Check weather and safety alerts before departure</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Stay in well-lit and populated areas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Trip Modal */}
      {showNewTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Plan New Trip</h3>
              <button
                onClick={() => setShowNewTrip(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trip Name</label>
                <input
                  type="text"
                  value={newTrip.name}
                  onChange={(e) => setNewTrip(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Weekend Getaway"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                <input
                  type="text"
                  value={newTrip.destination}
                  onChange={(e) => setNewTrip(prev => ({ ...prev, destination: e.target.value }))}
                  placeholder="Central Park"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newTrip.startDate}
                    onChange={(e) => setNewTrip(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={newTrip.endDate}
                    onChange={(e) => setNewTrip(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Safety Level</label>
                <select
                  value={newTrip.safetyLevel}
                  onChange={(e) => setNewTrip(prev => ({ ...prev, safetyLevel: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="high">High Safety</option>
                  <option value="medium">Medium Safety</option>
                  <option value="low">Adventure Mode</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newTrip.description}
                  onChange={(e) => setNewTrip(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of your trip..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewTrip(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTrip}
                disabled={!newTrip.name || !newTrip.destination}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                Create Trip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trip Details Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Trip Details</h3>
              <button
                onClick={() => setSelectedTrip(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 text-xl">{selectedTrip.name}</h4>
                <p className="text-gray-600">{selectedTrip.destination}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <p className="text-gray-900">{new Date(selectedTrip.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <p className="text-gray-900">{new Date(selectedTrip.endDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900">{selectedTrip.description}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Blockchain ID</label>
                <BlockchainIdBadge blockchainId={selectedTrip.blockchainId} showFull={true} />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedTrip(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                Start Trip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TouristTripPlanning;