import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, AlertTriangle, Calendar, Download, Filter, Eye } from 'lucide-react';
import AdminNavbar from '../components/layout/AdminNavbar';
import { fetchTourists, fetchSOSAlerts, fetchReports, fetchGeofenceAlerts } from '../services/api';

/**
 * Admin Reports & Analytics Page
 * Comprehensive analytics and reporting dashboard
 */

const AdminReports = () => {
  const [data, setData] = useState({
    tourists: [],
    sosAlerts: [],
    reports: [],
    geofenceAlerts: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7days');
  const [selectedMetric, setSelectedMetric] = useState('incidents');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [touristsResult, sosResult, reportsResult, geofenceResult] = await Promise.all([
        fetchTourists(),
        fetchSOSAlerts(),
        fetchReports(),
        fetchGeofenceAlerts()
      ]);

      setData({
        tourists: touristsResult.success ? touristsResult.data : [],
        sosAlerts: sosResult.success ? sosResult.data : [],
        reports: reportsResult.success ? reportsResult.data : [],
        geofenceAlerts: geofenceResult.success ? geofenceResult.data : []
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeData = (items, days) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return items.filter(item => new Date(item.timestamp || item.registeredAt) >= cutoffDate);
  };

  const calculateStats = () => {
    const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90;
    
    const recentSOS = getDateRangeData(data.sosAlerts, days);
    const recentReports = getDateRangeData(data.reports, days);
    const recentGeofence = getDateRangeData(data.geofenceAlerts, days);
    const recentTourists = getDateRangeData(data.tourists, days);

    return {
      totalIncidents: recentSOS.length + recentReports.length + recentGeofence.length,
      sosAlerts: recentSOS.length,
      reports: recentReports.length,
      geofenceAlerts: recentGeofence.length,
      newTourists: recentTourists.length,
      activeTourists: data.tourists.filter(t => t.status === 'active').length,
      resolvedIncidents: [...recentSOS, ...recentReports].filter(i => i.status === 'resolved').length,
      responseTime: '12 min', // Mock data
      safetyScore: Math.max(50, 100 - (recentSOS.length * 5) - (recentReports.length * 2))
    };
  };

  const generateChartData = () => {
    const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90;
    const chartData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayData = {
        date: dateStr,
        label: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : date.toLocaleDateString('en-US', { weekday: 'short' }),
        incidents: 0,
        sos: 0,
        reports: 0,
        geofence: 0,
        tourists: 0
      };
      
      // Count incidents for this day
      data.sosAlerts.forEach(alert => {
        if (alert.timestamp.startsWith(dateStr)) dayData.sos++;
      });
      
      data.reports.forEach(report => {
        if (report.timestamp.startsWith(dateStr)) dayData.reports++;
      });
      
      data.geofenceAlerts.forEach(alert => {
        if (alert.timestamp.startsWith(dateStr)) dayData.geofence++;
      });
      
      data.tourists.forEach(tourist => {
        if (tourist.registeredAt.startsWith(dateStr)) dayData.tourists++;
      });
      
      dayData.incidents = dayData.sos + dayData.reports + dayData.geofence;
      chartData.push(dayData);
    }
    
    return chartData;
  };

  const getIncidentsByType = () => {
    const sosTypes = {};
    const reportTypes = {};
    
    data.sosAlerts.forEach(alert => {
      sosTypes[alert.type] = (sosTypes[alert.type] || 0) + 1;
    });
    
    data.reports.forEach(report => {
      reportTypes[report.type] = (reportTypes[report.type] || 0) + 1;
    });
    
    return { sosTypes, reportTypes };
  };

  const getTopLocations = () => {
    const locations = {};
    
    [...data.sosAlerts, ...data.reports, ...data.geofenceAlerts].forEach(item => {
      if (item.location) {
        locations[item.location] = (locations[item.location] || 0) + 1;
      }
    });
    
    return Object.entries(locations)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const stats = calculateStats();
  const chartData = generateChartData();
  const { sosTypes, reportTypes } = getIncidentsByType();
  const topLocations = getTopLocations();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading reports...</span>
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
            <p className="text-gray-600">Comprehensive insights into tourist safety metrics and trends</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Incidents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalIncidents}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  -12% from last period
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Tourists</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeTourists}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8% from last period
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Safety Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.safetyScore}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +3% from last period
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{stats.responseTime}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  -2min from last period
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Incidents Over Time Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Incidents Over Time</h2>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="incidents">All Incidents</option>
                <option value="sos">SOS Alerts</option>
                <option value="reports">Reports</option>
                <option value="geofence">Geofence Alerts</option>
              </select>
            </div>
            
            <div className="h-64 flex items-end justify-between space-x-2">
              {chartData.map((day, index) => {
                const value = day[selectedMetric];
                const maxValue = Math.max(...chartData.map(d => d[selectedMetric])) || 1;
                const height = (value / maxValue) * 200;
                
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                      style={{ height: `${height}px`, minHeight: value > 0 ? '4px' : '0px' }}
                      title={`${day.label}: ${value} ${selectedMetric}`}
                    ></div>
                    <span className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-left">
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Incident Types Breakdown */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Incident Types</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">SOS Alerts</h3>
                <div className="space-y-2">
                  {Object.entries(sosTypes).slice(0, 5).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{type}</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${(count / Math.max(...Object.values(sosTypes))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Reports</h3>
                <div className="space-y-2">
                  {Object.entries(reportTypes).slice(0, 5).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{type}</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{ width: `${(count / Math.max(...Object.values(reportTypes))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Incident Locations */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Incident Locations</h2>
            
            <div className="space-y-4">
              {topLocations.map(([location, count], index) => (
                <div key={location} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-900">{location}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{count} incidents</span>
                </div>
              ))}
              
              {topLocations.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No location data available</p>
              )}
            </div>
          </div>

          {/* Recent Activity Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-red-900">SOS Alerts</p>
                    <p className="text-xs text-red-700">Last 24 hours</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-red-600">{stats.sosAlerts}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <BarChart3 className="w-5 h-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Reports</p>
                    <p className="text-xs text-yellow-700">Last 24 hours</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-yellow-600">{stats.reports}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-900">New Tourists</p>
                    <p className="text-xs text-green-700">Last 24 hours</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-green-600">{stats.newTourists}</span>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">System Health</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Response Rate</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">95%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Resolution Rate</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">88%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">User Satisfaction</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">92%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Uptime</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '99%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">99.9%</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Overall Health Score</span>
                <span className="text-lg font-bold text-green-600">Excellent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;