import React, { useState, useEffect } from 'react';
import { User, Shield, Calendar, Mail, Phone, AlertTriangle, MapPin, FileText, Activity, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TouristNavbar from '../components/layout/TouristNavbar';
import BlockchainIdBadge from '../components/common/BlockchainIdBadge';
import { fetchTouristByBlockchainId } from '../services/api';

/**
 * Tourist Profile Page
 * Displays and manages tourist profile information with Blockchain ID
 */

const TouristProfile = () => {
  const { user } = useAuth();
  const [touristData, setTouristData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    emergencyContact: '',
    medicalInfo: ''
  });

  useEffect(() => {
    if (user?.blockchainId) {
      fetchTouristData();
    }
  }, [user]);

  const fetchTouristData = async () => {
    try {
      const result = await fetchTouristByBlockchainId(user.blockchainId);
      if (result.success && result.data) {
        setTouristData(result.data);
        setEditForm({
          emergencyContact: result.data.profile?.emergencyContact || '',
          medicalInfo: result.data.profile?.medicalInfo || ''
        });
      }
    } catch (error) {
      console.error('Error fetching tourist data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = () => {
    // In a real implementation, this would call an API to update the profile
    console.log('Saving profile:', editForm);
    setEditing(false);
    // For now, just update local state
    if (touristData) {
      setTouristData({
        ...touristData,
        profile: {
          ...touristData.profile,
          ...editForm
        }
      });
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      emergencyContact: touristData?.profile?.emergencyContact || '',
      medicalInfo: touristData?.profile?.medicalInfo || ''
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TouristNavbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TouristNavbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-6">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Tourist Profile</h1>
                <p className="text-blue-100">Manage your safety profile and preferences</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100 mb-1">Secure Identity</p>
              <Shield className="w-8 h-8 mx-auto" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                <button
                  onClick={() => editing ? handleSaveProfile() : setEditing(true)}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    editing 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {editing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{user?.username}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{touristData?.email || 'Not provided'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Registration Date</label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">
                      {touristData?.registeredAt 
                        ? new Date(touristData.registeredAt).toLocaleDateString()
                        : 'Unknown'
                      }
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Activity className="w-5 h-5 text-green-500 mr-3" />
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {touristData?.status?.toUpperCase() || 'ACTIVE'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Safety Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                  {editing ? (
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-gray-400 mr-3" />
                      <input
                        type="text"
                        value={editForm.emergencyContact}
                        onChange={(e) => setEditForm(prev => ({ ...prev, emergencyContact: e.target.value }))}
                        placeholder="Enter emergency contact number"
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-900">
                        {touristData?.profile?.emergencyContact || 'Not provided'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medical Information</label>
                  {editing ? (
                    <div className="flex">
                      <AlertTriangle className="w-5 h-5 text-gray-400 mr-3 mt-3" />
                      <textarea
                        value={editForm.medicalInfo}
                        onChange={(e) => setEditForm(prev => ({ ...prev, medicalInfo: e.target.value }))}
                        placeholder="Enter any relevant medical information, allergies, or conditions"
                        rows={3}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  ) : (
                    <div className="flex p-3 bg-gray-50 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                      <span className="text-gray-900">
                        {touristData?.profile?.medicalInfo || 'Not provided'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {editing && (
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Blockchain ID Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <Shield className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Blockchain Identity</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Blockchain ID</label>
                  <BlockchainIdBadge 
                    blockchainId={user?.blockchainId} 
                    showFull={true}
                    size="lg"
                    className="w-full justify-center"
                  />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">What is this?</h4>
                  <p className="text-sm text-blue-700">
                    Your unique Blockchain ID ensures secure identification across all safety services. 
                    This ID is used for SOS alerts, incident reports, and location tracking.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center p-3 text-left bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                  <div>
                    <p className="font-medium text-red-900">Emergency SOS</p>
                    <p className="text-sm text-red-700">Quick access to emergency services</p>
                  </div>
                </button>
                
                <button className="w-full flex items-center p-3 text-left bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
                  <FileText className="w-5 h-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="font-medium text-yellow-900">Report Incident</p>
                    <p className="text-sm text-yellow-700">Report safety concerns</p>
                  </div>
                </button>
                
                <button className="w-full flex items-center p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <MapPin className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900">Location Tracking</p>
                    <p className="text-sm text-green-700">Manage location services</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Security Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Status</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Profile Completion</span>
                  <span className="text-sm font-medium text-green-600">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                
                <div className="pt-2 space-y-2">
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Blockchain ID verified</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Account active</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Emergency contact needed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TouristProfile;