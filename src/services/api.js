/**
 * API Service Layer for Tourist Safety Application
 * Structured for easy migration to real server/blockchain endpoints
 */

// Mock data storage (will be replaced with actual API calls)
const MOCK_STORAGE_KEY = 'tourist_safety_mock_data';

// Initialize mock storage
const initializeMockStorage = () => {
  const existing = localStorage.getItem(MOCK_STORAGE_KEY);
  if (!existing) {
    const initialData = {
      tourists: [],
      sosAlerts: [],
      reports: [],
      geofenceAlerts: []
    };
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(existing);
};

// Get mock data
const getMockData = () => {
  return JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY) || '{}');
};

// Save mock data
const saveMockData = (data) => {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data));
};

// Simulate network delay
const simulateNetworkDelay = (ms = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Generate unique Blockchain ID (24 characters alphanumeric)
export const generateBlockchainId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Tourist Management API
export const registerTourist = async (touristData) => {
  await simulateNetworkDelay();
  
  try {
    const mockData = getMockData();
    
    // Check if tourist already exists
    const existingTourist = mockData.tourists?.find(
      t => t.username === touristData.username
    );
    
    if (existingTourist) {
      return {
        success: true,
        data: existingTourist,
        message: 'Tourist already registered'
      };
    }
    
    // Generate new Blockchain ID
    const blockchainId = generateBlockchainId();
    
    const newTourist = {
      id: blockchainId,
      blockchainId,
      username: touristData.username,
      email: touristData.email || `${touristData.username}@tourist.local`,
      registeredAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      status: 'active',
      profile: {
        emergencyContact: touristData.emergencyContact || '',
        medicalInfo: touristData.medicalInfo || '',
        preferences: touristData.preferences || {}
      }
    };
    
    if (!mockData.tourists) mockData.tourists = [];
    mockData.tourists.push(newTourist);
    saveMockData(mockData);
    
    return {
      success: true,
      data: newTourist,
      message: 'Tourist registered successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const fetchTourists = async () => {
  await simulateNetworkDelay();
  
  try {
    const mockData = getMockData();
    return {
      success: true,
      data: mockData.tourists || []
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const fetchTouristByBlockchainId = async (blockchainId) => {
  await simulateNetworkDelay();
  
  try {
    const mockData = getMockData();
    const tourist = mockData.tourists?.find(t => t.blockchainId === blockchainId);
    
    return {
      success: true,
      data: tourist || null
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const updateTouristLastLogin = async (blockchainId) => {
  await simulateNetworkDelay();
  
  try {
    const mockData = getMockData();
    const touristIndex = mockData.tourists?.findIndex(t => t.blockchainId === blockchainId);
    
    if (touristIndex !== -1) {
      mockData.tourists[touristIndex].lastLogin = new Date().toISOString();
      saveMockData(mockData);
    }
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// SOS Alerts API
export const createSOSAlert = async (alertData) => {
  await simulateNetworkDelay();
  
  try {
    const mockData = getMockData();
    
    const sosAlert = {
      id: `sos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      blockchainId: alertData.blockchainId,
      touristUsername: alertData.touristUsername,
      type: 'SOS',
      severity: 'CRITICAL',
      message: alertData.message || 'Emergency SOS Alert',
      location: alertData.location || 'Unknown Location',
      coordinates: alertData.coordinates || null,
      timestamp: new Date().toISOString(),
      status: 'active',
      responseTime: null,
      resolvedAt: null
    };
    
    if (!mockData.sosAlerts) mockData.sosAlerts = [];
    mockData.sosAlerts.unshift(sosAlert);
    saveMockData(mockData);
    
    return {
      success: true,
      data: sosAlert
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const fetchSOSAlerts = async () => {
  await simulateNetworkDelay();
  
  try {
    const mockData = getMockData();
    return {
      success: true,
      data: mockData.sosAlerts || []
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const updateSOSAlertStatus = async (alertId, status) => {
  await simulateNetworkDelay();
  
  try {
    const mockData = getMockData();
    const alertIndex = mockData.sosAlerts?.findIndex(alert => alert.id === alertId);
    
    if (alertIndex !== -1) {
      mockData.sosAlerts[alertIndex].status = status;
      if (status === 'resolved') {
        mockData.sosAlerts[alertIndex].resolvedAt = new Date().toISOString();
      }
      saveMockData(mockData);
    }
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Reports API
export const createReport = async (reportData) => {
  await simulateNetworkDelay();
  
  try {
    const mockData = getMockData();
    
    const report = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      blockchainId: reportData.blockchainId,
      touristUsername: reportData.touristUsername,
      type: reportData.type || 'General Report',
      category: reportData.category || 'Safety Concern',
      title: reportData.title || 'Incident Report',
      description: reportData.description || '',
      location: reportData.location || 'Unknown Location',
      coordinates: reportData.coordinates || null,
      severity: reportData.severity || 'Medium',
      timestamp: new Date().toISOString(),
      status: 'pending',
      attachments: reportData.attachments || [],
      adminNotes: ''
    };
    
    if (!mockData.reports) mockData.reports = [];
    mockData.reports.unshift(report);
    saveMockData(mockData);
    
    return {
      success: true,
      data: report
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const fetchReports = async () => {
  await simulateNetworkDelay();
  
  try {
    const mockData = getMockData();
    return {
      success: true,
      data: mockData.reports || []
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const updateReportStatus = async (reportId, status, adminNotes = '') => {
  await simulateNetworkDelay();
  
  try {
    const mockData = getMockData();
    const reportIndex = mockData.reports?.findIndex(report => report.id === reportId);
    
    if (reportIndex !== -1) {
      mockData.reports[reportIndex].status = status;
      mockData.reports[reportIndex].adminNotes = adminNotes;
      mockData.reports[reportIndex].updatedAt = new Date().toISOString();
      saveMockData(mockData);
    }
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Geofence Alerts API
export const createGeofenceAlert = async (alertData) => {
  await simulateNetworkDelay();
  
  try {
    const mockData = getMockData();
    
    const geofenceAlert = {
      id: `geo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      blockchainId: alertData.blockchainId,
      touristUsername: alertData.touristUsername,
      type: 'GEOFENCE_VIOLATION',
      alertType: alertData.alertType || 'WARNING', // WARNING, DANGER, RESTRICTED
      zoneName: alertData.zoneName || 'Unknown Zone',
      zoneType: alertData.zoneType || 'restricted',
      location: alertData.location || 'Unknown Location',
      coordinates: alertData.coordinates || null,
      message: alertData.message || 'Geofence boundary crossed',
      timestamp: new Date().toISOString(),
      status: 'active',
      acknowledged: false,
      severity: alertData.severity || 'Medium'
    };
    
    if (!mockData.geofenceAlerts) mockData.geofenceAlerts = [];
    mockData.geofenceAlerts.unshift(geofenceAlert);
    saveMockData(mockData);
    
    return {
      success: true,
      data: geofenceAlert
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const fetchGeofenceAlerts = async () => {
  await simulateNetworkDelay();
  
  try {
    const mockData = getMockData();
    return {
      success: true,
      data: mockData.geofenceAlerts || []
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const acknowledgeGeofenceAlert = async (alertId) => {
  await simulateNetworkDelay();
  
  try {
    const mockData = getMockData();
    const alertIndex = mockData.geofenceAlerts?.findIndex(alert => alert.id === alertId);
    
    if (alertIndex !== -1) {
      mockData.geofenceAlerts[alertIndex].acknowledged = true;
      mockData.geofenceAlerts[alertIndex].status = 'acknowledged';
      saveMockData(mockData);
    }
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Verification API
export const verifyTouristBlockchainId = async (blockchainId) => {
  await simulateNetworkDelay();
  
  try {
    const mockData = getMockData();
    const tourist = mockData.tourists?.find(t => t.blockchainId === blockchainId);
    
    return {
      success: true,
      data: {
        valid: !!tourist,
        tourist: tourist || null,
        verificationStatus: tourist ? 'VERIFIED' : 'NOT_FOUND',
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Initialize mock storage on module load
initializeMockStorage();