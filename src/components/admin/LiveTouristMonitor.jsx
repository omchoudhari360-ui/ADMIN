import React, { useState } from 'react';
import { Users, MapPin, Activity, Clock, Eye, Navigation } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

/**
 * Live Tourist Monitor Component
 * Real-time monitoring of tourist activities and locations
 */

const LiveTouristMonitor = ({ tourists }) => {
  const [selectedTourist, setSelectedTourist] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'emergency':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatTimeAgo = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const formatLocation = (location) => {
    if (!location) return 'Location not available';
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-blue-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Live Tourist Monitor</h2>
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {tourists.filter(t => t.status === 'active').length} Active
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live Tracking</span>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-sm rounded ${viewMode === 'list' ? 'bg-white shadow' : 'text-gray-600'}`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1 text-sm rounded ${viewMode === 'map' ? 'bg-white shadow' : 'text-gray-600'}`}
              >
                Map
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {tourists.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No active tourists</p>
              </div>
            ) : (
              tourists.map((tourist) => (
                <div key={tourist.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{tourist.username}</h3>
                        <p className="text-sm text-gray-500">ID: {tourist.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tourist.status)}`}>
                        {tourist.status?.toUpperCase()}
                      </span>
                      <button
                        onClick={() => setSelectedTourist(tourist)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Last seen: {formatTimeAgo(tourist.lastSeen)}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{formatLocation(tourist.location)}</span>
                    </div>
                    <div className="flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      <span>
                        {tourist.lastActivity ? tourist.lastActivity.activity : 'No recent activity'}
                      </span>
                    </div>
                  </div>
                  
                  {tourist.incidents && tourist.incidents.length > 0 && (
                    <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                      <p className="text-sm text-yellow-800">
                        {tourist.incidents.length} incident(s) reported
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Navigation className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Map view coming soon</p>
              <p className="text-sm">Interactive tourist location mapping</p>
            </div>
          </div>
        )}
      </div>

      {/* Tourist Detail Modal */}
      {selectedTourist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Tourist Details</h3>
              <button
                onClick={() => setSelectedTourist(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <p className="text-gray-900">{selectedTourist.username}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Blockchain ID</label>
                  <p className="text-gray-900 font-mono text-sm">{selectedTourist.id}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(selectedTourist.status)}`}>
                    {selectedTourist.status?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Seen</label>
                  <p className="text-gray-900">{formatTimeAgo(selectedTourist.lastSeen)}</p>
                </div>
              </div>
              
              {selectedTourist.location && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Location</label>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-900">Latitude: {selectedTourist.location.latitude}</p>
                    <p className="text-gray-900">Longitude: {selectedTourist.location.longitude}</p>
                    <p className="text-gray-500 text-sm">
                      Accuracy: ±{selectedTourist.location.accuracy}m | 
                      Updated: {formatTimeAgo(selectedTourist.location.timestamp)}
                    </p>
                  </div>
                </div>
              )}
              
              {selectedTourist.lastActivity && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Activity</label>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-900">{selectedTourist.lastActivity.activity}</p>
                    {selectedTourist.lastActivity.details && (
                      <p className="text-gray-600 text-sm">{selectedTourist.lastActivity.details}</p>
                    )}
                    <p className="text-gray-500 text-sm">
                      {formatTimeAgo(selectedTourist.lastActivity.timestamp)}
                    </p>
                  </div>
                </div>
              )}
              
              {selectedTourist.incidents && selectedTourist.incidents.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Incidents</label>
                  <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                    <p className="text-yellow-800">
                      {selectedTourist.incidents.length} incident(s) reported
                    </p>
                    <p className="text-yellow-600 text-sm">
                      Incident IDs: {selectedTourist.incidents.join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedTourist(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveTouristMonitor;