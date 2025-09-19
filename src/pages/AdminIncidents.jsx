import React, { useState, useEffect } from 'react';
import { AlertTriangle, Search, Filter, Eye, Clock, MapPin, User, CheckCircle, XCircle } from 'lucide-react';
import AdminNavbar from '../components/layout/AdminNavbar';
import { fetchSOSAlerts, fetchReports, fetchGeofenceAlerts, updateSOSAlertStatus, updateReportStatus } from '../services/api';
import BlockchainIdBadge from '../components/common/BlockchainIdBadge';
import TouristDetailsModal from '../components/common/TouristDetailsModal';

/**
 * Admin Incidents Management Page
 * Manage all types of incidents: SOS alerts, reports, and geofence alerts
 */

const AdminIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTourist, setSelectedTourist] = useState(null);
  const [showTouristModal, setShowTouristModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showIncidentModal, setShowIncidentModal] = useState(false);

  useEffect(() => {
    fetchAllIncidents();
  }, []);

  useEffect(() => {
    filterIncidents();
  }, [incidents, searchTerm, typeFilter, statusFilter]);

  const fetchAllIncidents = async () => {
    try {
      const [sosResult, reportsResult, geofenceResult] = await Promise.all([
        fetchSOSAlerts(),
        fetchReports(),
        fetchGeofenceAlerts()
      ]);

      const allIncidents = [];

      if (sosResult.success) {
        allIncidents.push(...sosResult.data.map(item => ({ ...item, incidentType: 'SOS' })));
      }

      if (reportsResult.success) {
        allIncidents.push(...reportsResult.data.map(item => ({ ...item, incidentType: 'Report' })));
      }

      if (geofenceResult.success) {
        allIncidents.push(...geofenceResult.data.map(item => ({ ...item, incidentType: 'Geofence' })));
      }

      // Sort by timestamp (newest first)
      allIncidents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setIncidents(allIncidents);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterIncidents = () => {
    let filtered = incidents;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(incident =>
        incident.blockchainId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.touristUsername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(incident => incident.incidentType === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(incident => incident.status === statusFilter);
    }

    setFilteredIncidents(filtered);
  };

  const handleStatusUpdate = async (incident, newStatus) => {
    try {
      if (incident.incidentType === 'SOS') {
        await updateSOSAlertStatus(incident.id, newStatus);
      } else if (incident.incidentType === 'Report') {
        await updateReportStatus(incident.id, newStatus);
      }
      
      // Update local state
      setIncidents(prev => prev.map(item => 
        item.id === incident.id ? { ...item, status: newStatus } : item
      ));
    } catch (error) {
      console.error('Error updating incident status:', error);
    }
  };

  const getIncidentTypeColor = (type) => {
    switch (type) {
      case 'SOS': return 'bg-red-100 text-red-800';
      case 'Report': return 'bg-yellow-100 text-yellow-800';
      case 'Geofence': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'acknowledged': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading incidents...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Incident Management</h1>
          <p className="text-gray-600">Monitor and respond to all safety incidents and alerts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">SOS Alerts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {incidents.filter(i => i.incidentType === 'SOS').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reports</p>
                <p className="text-2xl font-bold text-gray-900">
                  {incidents.filter(i => i.incidentType === 'Report').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Geofence Alerts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {incidents.filter(i => i.incidentType === 'Geofence').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {incidents.filter(i => i.status === 'resolved').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search incidents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="SOS">SOS Alerts</option>
                  <option value="Report">Reports</option>
                  <option value="Geofence">Geofence Alerts</option>
                </select>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="acknowledged">Acknowledged</option>
                </select>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              Showing {filteredIncidents.length} of {incidents.length} incidents
            </div>
          </div>
        </div>

        {/* Incidents List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Incidents</h2>
          </div>
          
          {filteredIncidents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No incidents found</p>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredIncidents.map((incident) => (
                <div key={`${incident.incidentType}-${incident.id}`} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getIncidentTypeColor(incident.incidentType)}`}>
                        {incident.incidentType}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(incident.status)}`}>
                        {incident.status?.replace('_', ' ').toUpperCase()}
                      </span>
                      {incident.severity && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(incident.severity)}`}>
                          {incident.severity}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{formatTimeAgo(incident.timestamp)}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {incident.type || incident.title || `${incident.incidentType} Alert`}
                    </h3>
                    <p className="text-gray-700">
                      {incident.message || incident.description || 'No description available'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{incident.touristUsername}</p>
                        <BlockchainIdBadge 
                          blockchainId={incident.blockchainId}
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedTourist(incident.blockchainId);
                            setShowTouristModal(true);
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{incident.location || 'Location not available'}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {new Date(incident.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  {incident.adminNotes && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm font-medium text-blue-900 mb-1">Admin Notes:</p>
                      <p className="text-sm text-blue-800">{incident.adminNotes}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedIncident(incident);
                        setShowIncidentModal(true);
                      }}
                      className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      {incident.status === 'active' || incident.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(incident, 'in_progress')}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                          >
                            In Progress
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(incident, 'resolved')}
                            className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                          >
                            Resolve
                          </button>
                        </>
                      ) : incident.status === 'in_progress' ? (
                        <button
                          onClick={() => handleStatusUpdate(incident, 'resolved')}
                          className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                        >
                          Resolve
                      </button>
                      ) : (
                        <span className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          {incident.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tourist Details Modal */}
      <TouristDetailsModal
        blockchainId={selectedTourist}
        isOpen={showTouristModal}
        onClose={() => setShowTouristModal(false)}
      />

      {/* Incident Details Modal */}
      {selectedIncident && showIncidentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium text-gray-900">Incident Details</h3>
              <button
                onClick={() => setShowIncidentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getIncidentTypeColor(selectedIncident.incidentType)}`}>
                  {selectedIncident.incidentType}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedIncident.status)}`}>
                  {selectedIncident.status?.replace('_', ' ').toUpperCase()}
                </span>
                {selectedIncident.severity && (
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getSeverityColor(selectedIncident.severity)}`}>
                    {selectedIncident.severity}
                  </span>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Type/Title</label>
                <p className="text-gray-900">{selectedIncident.type || selectedIncident.title || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900">{selectedIncident.message || selectedIncident.description || 'No description available'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tourist</label>
                  <p className="text-gray-900">{selectedIncident.touristUsername}</p>
                  <BlockchainIdBadge 
                    blockchainId={selectedIncident.blockchainId}
                    size="sm"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <p className="text-gray-900">{selectedIncident.location || 'Not available'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reported At</label>
                  <p className="text-gray-900">{new Date(selectedIncident.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <p className="text-gray-900">{selectedIncident.category || selectedIncident.alertType || 'N/A'}</p>
                </div>
              </div>
              
              {selectedIncident.adminNotes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                  <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-blue-800">{selectedIncident.adminNotes}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowIncidentModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
              {(selectedIncident.status === 'active' || selectedIncident.status === 'pending') && (
                <>
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedIncident, 'in_progress');
                      setShowIncidentModal(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Mark In Progress
                  </button>
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedIncident, 'resolved');
                      setShowIncidentModal(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Mark Resolved
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminIncidents;