import React, { useState, useEffect } from 'react';
import { FileText, Camera, MapPin, Clock, AlertTriangle, Send, Plus, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TouristNavbar from '../components/layout/TouristNavbar';
import useWebSocket from '../hooks/useWebSocket';
import { createReport, fetchReports } from '../services/api';
import BlockchainIdBadge from '../components/common/BlockchainIdBadge';

/**
 * Tourist Report Page
 * Submit and track safety incident reports
 */

const TouristReport = () => {
  const { user } = useAuth();
  const { isConnected, reportActivity, createIncident } = useWebSocket();
  
  const [reports, setReports] = useState([]);
  const [showNewReport, setShowNewReport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  
  const [newReport, setNewReport] = useState({
    type: 'Safety Concern',
    category: 'General',
    title: '',
    description: '',
    location: '',
    severity: 'Medium',
    attachments: []
  });

  const reportTypes = [
    'Safety Concern',
    'Medical Emergency',
    'Lost Tourist',
    'Theft Report',
    'Harassment',
    'Infrastructure Issue',
    'Environmental Hazard',
    'Other'
  ];

  const categories = [
    'General',
    'Transportation',
    'Accommodation',
    'Food Safety',
    'Personal Safety',
    'Property Damage',
    'Discrimination',
    'Fraud/Scam'
  ];

  const severityLevels = ['Low', 'Medium', 'High', 'Critical'];

  useEffect(() => {
    if (isConnected) {
      reportActivity('report_page_visit', { timestamp: new Date().toISOString() });
    }
    fetchUserReports();
    getCurrentLocation();
  }, [isConnected, reportActivity]);

  const fetchUserReports = async () => {
    try {
      const result = await fetchReports();
      if (result.success) {
        // Filter reports for current user
        const userReports = result.data.filter(report => report.blockchainId === user?.blockchainId);
        setReports(userReports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Mock location for demo
          setLocation({
            latitude: 40.7128,
            longitude: -74.0060,
            accuracy: 10
          });
        }
      );
    }
  };

  const handleSubmitReport = async () => {
    if (!newReport.title || !newReport.description) return;

    setLoading(true);
    try {
      const reportData = {
        blockchainId: user?.blockchainId,
        touristUsername: user?.username,
        type: newReport.type,
        category: newReport.category,
        title: newReport.title,
        description: newReport.description,
        location: newReport.location || (location ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : 'Location not available'),
        coordinates: location ? { lat: location.latitude, lng: location.longitude } : null,
        severity: newReport.severity,
        attachments: newReport.attachments
      };

      const result = await createReport(reportData);
      
      if (result.success) {
        setReports(prev => [result.data, ...prev]);
        
        // Also create WebSocket incident for real-time admin updates
        createIncident({
          type: newReport.type,
          description: newReport.description,
          severity: newReport.severity,
          location: reportData.location
        });
        
        if (isConnected) {
          reportActivity('report_submitted', { 
            type: newReport.type,
            category: newReport.category,
            severity: newReport.severity
          });
        }
        
        // Reset form
        setNewReport({
          type: 'Safety Concern',
          category: 'General',
          title: '',
          description: '',
          location: '',
          severity: 'Medium',
          attachments: []
        });
        setShowNewReport(false);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <TouristNavbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Report Incident</h1>
              <p className="text-yellow-100 mb-4">Help keep our community safe by reporting incidents and concerns</p>
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
              <FileText className="w-12 h-12 mb-2" />
              <p className="text-sm text-yellow-100">Report System</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* New Report Button */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Submit New Report</h2>
                  <p className="text-gray-600">Report safety concerns, incidents, or issues you've encountered</p>
                </div>
                <button
                  onClick={() => setShowNewReport(true)}
                  className="flex items-center px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  New Report
                </button>
              </div>
            </div>

            {/* My Reports */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">My Reports</h2>
              
              {reports.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No reports submitted yet</p>
                  <p>Submit your first report to help improve safety for everyone</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{report.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}>
                            {report.severity}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {report.status?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <FileText className="w-4 h-4 mr-2" />
                          <span>{report.type} - {report.category}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{new Date(report.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">{report.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{report.location}</span>
                        </div>
                        {report.adminNotes && (
                          <div className="text-sm text-blue-600">
                            Admin Response Available
                          </div>
                        )}
                      </div>
                      
                      {report.adminNotes && (
                        <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                          <p className="text-sm font-medium text-blue-900 mb-1">Admin Response:</p>
                          <p className="text-sm text-blue-800">{report.adminNotes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Report Statistics */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Reports</span>
                  <span className="font-semibold text-gray-900">{reports.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-semibold text-yellow-600">
                    {reports.filter(r => r.status === 'pending').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Resolved</span>
                  <span className="font-semibold text-green-600">
                    {reports.filter(r => r.status === 'resolved').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Response Rate</span>
                  <span className="font-semibold text-blue-600">
                    {reports.length > 0 ? Math.round((reports.filter(r => r.adminNotes).length / reports.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Report Types */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Report</h3>
              <div className="space-y-2">
                {reportTypes.slice(0, 4).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setNewReport(prev => ({ ...prev, type }));
                      setShowNewReport(true);
                    }}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mr-3" />
                      <span className="text-sm font-medium text-gray-900">{type}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Reporting Guidelines */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reporting Guidelines</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p>Provide clear and detailed descriptions</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p>Include location information when possible</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p>Select appropriate severity level</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p>Be respectful and factual</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p>For emergencies, call 911 first</p>
                </div>
              </div>
            </div>

            {/* Emergency Notice */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center mb-3">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-red-900">Emergency Notice</h3>
              </div>
              <p className="text-sm text-red-800 mb-3">
                For immediate emergencies requiring police, fire, or medical assistance, call 911 directly.
              </p>
              <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Emergency SOS
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* New Report Modal */}
      {showNewReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium text-gray-900">Submit New Report</h3>
              <button
                onClick={() => setShowNewReport(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                  <select
                    value={newReport.type}
                    onChange={(e) => setNewReport(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    {reportTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newReport.category}
                    onChange={(e) => setNewReport(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newReport.title}
                  onChange={(e) => setNewReport(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief summary of the incident"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newReport.description}
                  onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of what happened..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={newReport.location}
                    onChange={(e) => setNewReport(prev => ({ ...prev, location: e.target.value }))}
                    placeholder={location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : "Enter location"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                  <select
                    value={newReport.severity}
                    onChange={(e) => setNewReport(prev => ({ ...prev, severity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    {severityLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to add photos or documents</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF up to 10MB</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewReport(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={loading || !newReport.title || !newReport.description}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TouristReport;