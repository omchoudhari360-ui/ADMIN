import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Eye, Shield, MapPin, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import AdminNavbar from '../components/layout/AdminNavbar';
import { fetchTourists, verifyTouristBlockchainId } from '../services/api';
import BlockchainIdBadge from '../components/common/BlockchainIdBadge';
import TouristDetailsModal from '../components/common/TouristDetailsModal';

/**
 * Admin Users Management Page
 * Manage and monitor all registered tourists
 */

const AdminUsers = () => {
  const [tourists, setTourists] = useState([]);
  const [filteredTourists, setFilteredTourists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTourist, setSelectedTourist] = useState(null);
  const [showTouristModal, setShowTouristModal] = useState(false);
  const [verificationResults, setVerificationResults] = useState({});

  useEffect(() => {
    fetchTouristData();
  }, []);

  useEffect(() => {
    filterTourists();
  }, [tourists, searchTerm, statusFilter]);

  const fetchTouristData = async () => {
    try {
      const result = await fetchTourists();
      if (result.success) {
        setTourists(result.data);
      }
    } catch (error) {
      console.error('Error fetching tourists:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTourists = () => {
    let filtered = tourists;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tourist =>
        tourist.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tourist.blockchainId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tourist.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tourist => tourist.status === statusFilter);
    }

    setFilteredTourists(filtered);
  };

  const handleTouristClick = (blockchainId) => {
    setSelectedTourist(blockchainId);
    setShowTouristModal(true);
  };

  const handleVerifyTourist = async (blockchainId) => {
    try {
      const result = await verifyTouristBlockchainId(blockchainId);
      if (result.success) {
        setVerificationResults(prev => ({
          ...prev,
          [blockchainId]: result.data
        }));
      }
    } catch (error) {
      console.error('Error verifying tourist:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than 1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading users...</span>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Monitor and manage all registered tourists in the system</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{tourists.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tourists.filter(t => t.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent Logins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tourists.filter(t => {
                    const lastLogin = new Date(t.lastLogin);
                    const now = new Date();
                    return (now - lastLogin) < (24 * 60 * 60 * 1000); // Last 24 hours
                  }).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Suspended</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tourists.filter(t => t.status === 'suspended').length}
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
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              Showing {filteredTourists.length} of {tourists.length} users
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Registered Tourists</h2>
          </div>
          
          {filteredTourists.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No users found</p>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Blockchain ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTourists.map((tourist) => (
                    <tr key={tourist.blockchainId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{tourist.username}</div>
                            <div className="text-sm text-gray-500">{tourist.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <BlockchainIdBadge 
                          blockchainId={tourist.blockchainId}
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => handleTouristClick(tourist.blockchainId)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tourist.status)}`}>
                          {tourist.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTimeAgo(tourist.lastLogin)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(tourist.registeredAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleTouristClick(tourist.blockchainId)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleVerifyTourist(tourist.blockchainId)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        {verificationResults[tourist.blockchainId] && (
                          <span className={`ml-2 text-xs ${
                            verificationResults[tourist.blockchainId].valid 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {verificationResults[tourist.blockchainId].valid ? '✓' : '✗'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent User Activity</h2>
          <div className="space-y-3">
            {tourists
              .sort((a, b) => new Date(b.lastLogin) - new Date(a.lastLogin))
              .slice(0, 5)
              .map((tourist) => (
                <div key={tourist.blockchainId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tourist.username}</p>
                      <p className="text-xs text-gray-500">Last login: {formatTimeAgo(tourist.lastLogin)}</p>
                    </div>
                  </div>
                  <BlockchainIdBadge 
                    blockchainId={tourist.blockchainId}
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => handleTouristClick(tourist.blockchainId)}
                  />
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Tourist Details Modal */}
      <TouristDetailsModal
        blockchainId={selectedTourist}
        isOpen={showTouristModal}
        onClose={() => setShowTouristModal(false)}
      />
    </div>
  );
};

export default AdminUsers;