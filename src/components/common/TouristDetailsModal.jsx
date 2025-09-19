import React, { useState, useEffect } from 'react';
import { X, Shield, Calendar, MapPin, Phone, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { fetchTouristByBlockchainId, verifyTouristBlockchainId } from '../../services/api';
import BlockchainIdBadge from './BlockchainIdBadge';

/**
 * Tourist Details Modal Component
 * Shows comprehensive tourist information with verification
 */

const TouristDetailsModal = ({ blockchainId, isOpen, onClose }) => {
  const [tourist, setTourist] = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (isOpen && blockchainId) {
      fetchTouristDetails();
    }
  }, [isOpen, blockchainId]);

  const fetchTouristDetails = async () => {
    setLoading(true);
    try {
      const result = await fetchTouristByBlockchainId(blockchainId);
      if (result.success) {
        setTourist(result.data);
      }
    } catch (error) {
      console.error('Error fetching tourist details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTourist = async () => {
    setVerifying(true);
    try {
      const result = await verifyTouristBlockchainId(blockchainId);
      if (result.success) {
        setVerification(result.data);
      }
    } catch (error) {
      console.error('Error verifying tourist:', error);
    } finally {
      setVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Shield className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Tourist Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading tourist details...</span>
            </div>
          ) : tourist ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <p className="text-gray-900">{tourist.username}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{tourist.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tourist.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {tourist.status?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blockchain ID</label>
                    <BlockchainIdBadge blockchainId={tourist.blockchainId} showFull={true} />
                  </div>
                </div>
              </div>

              {/* Registration & Login Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Registration & Activity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Registered</p>
                      <p className="text-sm text-gray-600">
                        {new Date(tourist.registeredAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Last Login</p>
                      <p className="text-sm text-gray-600">
                        {new Date(tourist.lastLogin).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              {tourist.profile && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
                  <div className="space-y-3">
                    {tourist.profile.emergencyContact && (
                      <div className="flex items-center">
                        <Phone className="w-5 h-5 text-red-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Emergency Contact</p>
                          <p className="text-sm text-gray-600">{tourist.profile.emergencyContact}</p>
                        </div>
                      </div>
                    )}
                    {tourist.profile.medicalInfo && (
                      <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Medical Information</p>
                          <p className="text-sm text-gray-600">{tourist.profile.medicalInfo}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Verification Section */}
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Blockchain Verification</h3>
                  <button
                    onClick={handleVerifyTourist}
                    disabled={verifying}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {verifying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Verify Tourist
                      </>
                    )}
                  </button>
                </div>
                
                {verification && (
                  <div className={`p-3 rounded-md ${
                    verification.valid 
                      ? 'bg-green-100 border border-green-200' 
                      : 'bg-red-100 border border-red-200'
                  }`}>
                    <div className="flex items-center">
                      {verification.valid ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                      )}
                      <div>
                        <p className={`font-medium ${
                          verification.valid ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {verification.valid ? 'Valid Blockchain ID' : 'Invalid Blockchain ID'}
                        </p>
                        <p className={`text-sm ${
                          verification.valid ? 'text-green-600' : 'text-red-600'
                        }`}>
                          Status: {verification.verificationStatus}
                        </p>
                        <p className="text-xs text-gray-500">
                          Verified at: {new Date(verification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Tourist not found</p>
              <p className="text-sm text-gray-500">Blockchain ID: {blockchainId}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TouristDetailsModal;