import React, { useState } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle, Plus, Send, Megaphone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

/**
 * System Alerts Component
 * Manages system alerts and emergency broadcasts
 */

const SystemAlerts = ({ alerts, onSendAlert, onEmergencyBroadcast }) => {
  const [showNewAlert, setShowNewAlert] = useState(false);
  const [showEmergencyBroadcast, setShowEmergencyBroadcast] = useState(false);
  const [newAlert, setNewAlert] = useState({
    type: 'info',
    message: ''
  });
  const [emergencyMessage, setEmergencyMessage] = useState('');

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning':
        return AlertTriangle;
      case 'error':
        return AlertTriangle;
      case 'success':
        return CheckCircle;
      default:
        return Info;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'warning':
        return 'border-yellow-400 bg-yellow-50 text-yellow-800';
      case 'error':
        return 'border-red-400 bg-red-50 text-red-800';
      case 'success':
        return 'border-green-400 bg-green-50 text-green-800';
      default:
        return 'border-blue-400 bg-blue-50 text-blue-800';
    }
  };

  const formatTimeAgo = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  const handleSendAlert = () => {
    if (newAlert.message.trim()) {
      onSendAlert(newAlert.type, newAlert.message);
      setNewAlert({ type: 'info', message: '' });
      setShowNewAlert(false);
    }
  };

  const handleEmergencyBroadcast = () => {
    if (emergencyMessage.trim()) {
      onEmergencyBroadcast(emergencyMessage);
      setEmergencyMessage('');
      setShowEmergencyBroadcast(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Bell className="w-6 h-6 text-blue-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">System Alerts</h2>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowEmergencyBroadcast(true)}
              className="flex items-center px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              <Megaphone className="w-4 h-4 mr-2" />
              Emergency
            </button>
            <button
              onClick={() => setShowNewAlert(true)}
              className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Alert
            </button>
          </div>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No system alerts</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const IconComponent = getAlertIcon(alert.type);
              return (
                <div key={alert.id} className={`border-l-4 p-4 rounded ${getAlertColor(alert.type)}`}>
                  <div className="flex items-start">
                    <IconComponent className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {formatTimeAgo(alert.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* New Alert Modal */}
      {showNewAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Send System Alert</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alert Type</label>
                <select
                  value={newAlert.type}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="success">Success</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={newAlert.message}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter alert message..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewAlert(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSendAlert}
                disabled={!newAlert.message.trim()}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Broadcast Modal */}
      {showEmergencyBroadcast && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <Megaphone className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Emergency Broadcast</h3>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800">
                This will send an immediate emergency notification to all active tourists.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Message</label>
              <textarea
                value={emergencyMessage}
                onChange={(e) => setEmergencyMessage(e.target.value)}
                placeholder="Enter emergency message..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEmergencyBroadcast(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEmergencyBroadcast}
                disabled={!emergencyMessage.trim()}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Megaphone className="w-4 h-4 mr-2" />
                Send Emergency Broadcast
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SystemAlerts;