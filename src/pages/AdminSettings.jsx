import React, { useState } from 'react';
import { Settings, Shield, Bell, Users, MapPin, Database, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import AdminNavbar from '../components/layout/AdminNavbar';
import { useAuth } from '../contexts/AuthContext';

/**
 * Admin Settings Page
 * System configuration and administrative settings
 */

const AdminSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      systemName: 'Tourist Safety System',
      adminEmail: 'admin@touristsafety.com',
      timezone: 'UTC',
      language: 'en',
      maintenanceMode: false
    },
    security: {
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      requireTwoFactor: false,
      blockchainValidation: true,
      encryptionLevel: 'AES-256'
    },
    notifications: {
      emailAlerts: true,
      smsAlerts: false,
      pushNotifications: true,
      alertThreshold: 'medium',
      emergencyContacts: ['admin@touristsafety.com']
    },
    users: {
      autoApproval: true,
      maxUsers: 10000,
      userDataRetention: 365,
      allowGuestAccess: false,
      requireEmailVerification: false
    },
    geofencing: {
      enabled: true,
      defaultRadius: 1000,
      alertTypes: ['warning', 'danger', 'restricted'],
      autoCreateZones: false
    },
    database: {
      backupFrequency: 'daily',
      retentionPeriod: 90,
      compressionEnabled: true,
      encryptionEnabled: true
    }
  });
  
  const [saveStatus, setSaveStatus] = useState(null);

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'geofencing', name: 'Geofencing', icon: MapPin },
    { id: 'database', name: 'Database', icon: Database }
  ];

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    // In a real implementation, this would save to the server
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    }, 1000);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">System Name</label>
        <input
          type="text"
          value={settings.general.systemName}
          onChange={(e) => handleSettingChange('general', 'systemName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
        <input
          type="email"
          value={settings.general.adminEmail}
          onChange={(e) => handleSettingChange('general', 'adminEmail', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
          <select
            value={settings.general.timezone}
            onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="UTC">UTC</option>
            <option value="EST">Eastern Time</option>
            <option value="PST">Pacific Time</option>
            <option value="GMT">Greenwich Mean Time</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
          <select
            value={settings.general.language}
            onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
      </div>
      
      <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
          <div>
            <p className="font-medium text-yellow-900">Maintenance Mode</p>
            <p className="text-sm text-yellow-700">Temporarily disable user access for system maintenance</p>
          </div>
        </div>
        <button
          onClick={() => handleSettingChange('general', 'maintenanceMode', !settings.general.maintenanceMode)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.general.maintenanceMode ? 'bg-yellow-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.general.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (hours)</label>
          <input
            type="number"
            value={settings.security.sessionTimeout}
            onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
          <input
            type="number"
            value={settings.security.maxLoginAttempts}
            onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Encryption Level</label>
        <select
          value={settings.security.encryptionLevel}
          onChange={(e) => handleSettingChange('security', 'encryptionLevel', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="AES-128">AES-128</option>
          <option value="AES-256">AES-256</option>
          <option value="RSA-2048">RSA-2048</option>
        </select>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Two-Factor Authentication</p>
            <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
          </div>
          <button
            onClick={() => handleSettingChange('security', 'requireTwoFactor', !settings.security.requireTwoFactor)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.security.requireTwoFactor ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.security.requireTwoFactor ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Blockchain Validation</p>
            <p className="text-sm text-gray-600">Validate tourist Blockchain IDs</p>
          </div>
          <button
            onClick={() => handleSettingChange('security', 'blockchainValidation', !settings.security.blockchainValidation)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.security.blockchainValidation ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.security.blockchainValidation ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Email Alerts</p>
            <p className="text-sm text-gray-600">Send email notifications for incidents</p>
          </div>
          <button
            onClick={() => handleSettingChange('notifications', 'emailAlerts', !settings.notifications.emailAlerts)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.notifications.emailAlerts ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications.emailAlerts ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">SMS Alerts</p>
            <p className="text-sm text-gray-600">Send SMS notifications for critical incidents</p>
          </div>
          <button
            onClick={() => handleSettingChange('notifications', 'smsAlerts', !settings.notifications.smsAlerts)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.notifications.smsAlerts ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications.smsAlerts ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Push Notifications</p>
            <p className="text-sm text-gray-600">Send push notifications to admin devices</p>
          </div>
          <button
            onClick={() => handleSettingChange('notifications', 'pushNotifications', !settings.notifications.pushNotifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.notifications.pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications.pushNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Alert Threshold</label>
        <select
          value={settings.notifications.alertThreshold}
          onChange={(e) => handleSettingChange('notifications', 'alertThreshold', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="low">Low - All incidents</option>
          <option value="medium">Medium - Important incidents</option>
          <option value="high">High - Critical incidents only</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contacts</label>
        <div className="space-y-2">
          {settings.notifications.emergencyContacts.map((contact, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="email"
                value={contact}
                onChange={(e) => {
                  const newContacts = [...settings.notifications.emergencyContacts];
                  newContacts[index] = e.target.value;
                  handleSettingChange('notifications', 'emergencyContacts', newContacts);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => {
                  const newContacts = settings.notifications.emergencyContacts.filter((_, i) => i !== index);
                  handleSettingChange('notifications', 'emergencyContacts', newContacts);
                }}
                className="px-3 py-2 text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newContacts = [...settings.notifications.emergencyContacts, ''];
              handleSettingChange('notifications', 'emergencyContacts', newContacts);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            + Add Contact
          </button>
        </div>
      </div>
    </div>
  );

  const renderUserSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Users</label>
          <input
            type="number"
            value={settings.users.maxUsers}
            onChange={(e) => handleSettingChange('users', 'maxUsers', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data Retention (days)</label>
          <input
            type="number"
            value={settings.users.userDataRetention}
            onChange={(e) => handleSettingChange('users', 'userDataRetention', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Auto-Approval</p>
            <p className="text-sm text-gray-600">Automatically approve new user registrations</p>
          </div>
          <button
            onClick={() => handleSettingChange('users', 'autoApproval', !settings.users.autoApproval)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.users.autoApproval ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.users.autoApproval ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Guest Access</p>
            <p className="text-sm text-gray-600">Allow limited access without registration</p>
          </div>
          <button
            onClick={() => handleSettingChange('users', 'allowGuestAccess', !settings.users.allowGuestAccess)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.users.allowGuestAccess ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.users.allowGuestAccess ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Email Verification</p>
            <p className="text-sm text-gray-600">Require email verification for new accounts</p>
          </div>
          <button
            onClick={() => handleSettingChange('users', 'requireEmailVerification', !settings.users.requireEmailVerification)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.users.requireEmailVerification ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.users.requireEmailVerification ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderGeofencingSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">Enable Geofencing</p>
          <p className="text-sm text-gray-600">Monitor tourist locations and send alerts</p>
        </div>
        <button
          onClick={() => handleSettingChange('geofencing', 'enabled', !settings.geofencing.enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.geofencing.enabled ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.geofencing.enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Default Radius (meters)</label>
        <input
          type="number"
          value={settings.geofencing.defaultRadius}
          onChange={(e) => handleSettingChange('geofencing', 'defaultRadius', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Alert Types</label>
        <div className="space-y-2">
          {['warning', 'danger', 'restricted', 'safe_zone'].map((type) => (
            <label key={type} className="flex items-center">
              <input
                type="checkbox"
                checked={settings.geofencing.alertTypes.includes(type)}
                onChange={(e) => {
                  const newTypes = e.target.checked
                    ? [...settings.geofencing.alertTypes, type]
                    : settings.geofencing.alertTypes.filter(t => t !== type);
                  handleSettingChange('geofencing', 'alertTypes', newTypes);
                }}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 capitalize">{type.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">Auto-Create Zones</p>
          <p className="text-sm text-gray-600">Automatically create geofence zones based on incidents</p>
        </div>
        <button
          onClick={() => handleSettingChange('geofencing', 'autoCreateZones', !settings.geofencing.autoCreateZones)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.geofencing.autoCreateZones ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.geofencing.autoCreateZones ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );

  const renderDatabaseSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
        <select
          value={settings.database.backupFrequency}
          onChange={(e) => handleSettingChange('database', 'backupFrequency', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Retention Period (days)</label>
        <input
          type="number"
          value={settings.database.retentionPeriod}
          onChange={(e) => handleSettingChange('database', 'retentionPeriod', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Compression</p>
            <p className="text-sm text-gray-600">Enable database compression to save storage</p>
          </div>
          <button
            onClick={() => handleSettingChange('database', 'compressionEnabled', !settings.database.compressionEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.database.compressionEnabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.database.compressionEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Encryption</p>
            <p className="text-sm text-gray-600">Encrypt database at rest</p>
          </div>
          <button
            onClick={() => handleSettingChange('database', 'encryptionEnabled', !settings.database.encryptionEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.database.encryptionEnabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.database.encryptionEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Database Status</h4>
        <div className="space-y-1 text-sm text-blue-800">
          <p>Last Backup: 2 hours ago</p>
          <p>Database Size: 2.4 GB</p>
          <p>Connection Status: Active</p>
          <p>Performance: Optimal</p>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings();
      case 'security': return renderSecuritySettings();
      case 'notifications': return renderNotificationSettings();
      case 'users': return renderUserSettings();
      case 'geofencing': return renderGeofencingSettings();
      case 'database': return renderDatabaseSettings();
      default: return renderGeneralSettings();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h1>
            <p className="text-gray-600">Configure system preferences and administrative settings</p>
          </div>
          <div className="flex items-center space-x-4">
            {saveStatus && (
              <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
                saveStatus === 'saving' ? 'bg-blue-100 text-blue-800' :
                saveStatus === 'success' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {saveStatus === 'saving' && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>}
                {saveStatus === 'success' && <CheckCircle className="w-4 h-4 mr-2" />}
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : 'Error'}
              </div>
            )}
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 mr-3" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {tabs.find(tab => tab.id === activeTab)?.name} Settings
                </h2>
                <p className="text-gray-600">
                  Configure {tabs.find(tab => tab.id === activeTab)?.name.toLowerCase()} preferences and options
                </p>
              </div>
              
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;