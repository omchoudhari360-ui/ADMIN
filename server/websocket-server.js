const WebSocket = require('ws');
const http = require('http');
const { v4: uuidv4 } = require('uuid');

/**
 * WebSocket Server for Real-time Tourist Safety System
 * Handles real-time communication between admin panel and tourist interfaces
 */

class TouristSafetyWebSocketServer {
  constructor(port = 8080) {
    this.port = port;
    this.server = http.createServer();
    this.wss = new WebSocket.Server({ server: this.server });
    
    // In-memory data store (in production, this would be a database)
    this.data = {
      tourists: new Map(),
      incidents: new Map(),
      systemAlerts: [],
      stats: {
        activeTourists: 0,
        activeIncidents: 0,
        reportsToday: 0,
        safetyScore: 94
      }
    };
    
    this.clients = {
      admins: new Set(),
      tourists: new Set()
    };
    
    this.setupWebSocketHandlers();
    this.startDataSimulation();
  }

  setupWebSocketHandlers() {
    this.wss.on('connection', (ws, request) => {
      console.log('New WebSocket connection established');
      
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(ws, data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        this.clients.admins.delete(ws);
        this.clients.tourists.delete(ws);
        console.log('WebSocket connection closed');
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  handleMessage(ws, data) {
    switch (data.type) {
      case 'auth':
        this.handleAuth(ws, data);
        break;
      case 'tourist_activity':
        this.handleTouristActivity(ws, data);
        break;
      case 'create_incident':
        this.handleCreateIncident(ws, data);
        break;
      case 'update_incident':
        this.handleUpdateIncident(ws, data);
        break;
      case 'admin_action':
        this.handleAdminAction(ws, data);
        break;
      case 'location_update':
        this.handleLocationUpdate(ws, data);
        break;
      default:
        ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
    }
  }

  handleAuth(ws, data) {
    const { role, userId, username } = data;
    
    if (role === 'admin') {
      this.clients.admins.add(ws);
      ws.role = 'admin';
      ws.userId = userId;
      
      // Send initial admin data
      ws.send(JSON.stringify({
        type: 'auth_success',
        role: 'admin',
        data: {
          tourists: Array.from(this.data.tourists.values()),
          incidents: Array.from(this.data.incidents.values()),
          systemAlerts: this.data.systemAlerts,
          stats: this.data.stats
        }
      }));
    } else if (role === 'tourist') {
      this.clients.tourists.add(ws);
      ws.role = 'tourist';
      ws.userId = userId;
      ws.username = username;
      
      // Add tourist to active list
      this.data.tourists.set(userId, {
        id: userId,
        username: username,
        status: 'active',
        lastSeen: new Date().toISOString(),
        location: null,
        incidents: []
      });
      
      this.updateStats();
      this.broadcastToAdmins('tourist_joined', {
        tourist: this.data.tourists.get(userId)
      });
      
      ws.send(JSON.stringify({
        type: 'auth_success',
        role: 'tourist'
      }));
    }
  }

  handleTouristActivity(ws, data) {
    const { activity, details } = data;
    const tourist = this.data.tourists.get(ws.userId);
    
    if (tourist) {
      tourist.lastSeen = new Date().toISOString();
      tourist.lastActivity = { activity, details, timestamp: new Date().toISOString() };
      
      this.broadcastToAdmins('tourist_activity', {
        touristId: ws.userId,
        activity,
        details,
        timestamp: new Date().toISOString()
      });
    }
  }

  handleCreateIncident(ws, data) {
    const { type, description, severity, location } = data;
    const incidentId = uuidv4();
    
    const incident = {
      id: incidentId,
      type,
      description,
      severity,
      location,
      status: 'active',
      reportedBy: ws.userId,
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.data.incidents.set(incidentId, incident);
    
    // Update tourist's incident list
    const tourist = this.data.tourists.get(ws.userId);
    if (tourist) {
      tourist.incidents.push(incidentId);
    }
    
    this.updateStats();
    
    // Broadcast to all clients
    this.broadcastToAdmins('new_incident', { incident });
    this.broadcastToTourists('incident_created', { incident });
    
    // Send confirmation to reporter
    ws.send(JSON.stringify({
      type: 'incident_created',
      incident
    }));
  }

  handleUpdateIncident(ws, data) {
    const { incidentId, updates } = data;
    const incident = this.data.incidents.get(incidentId);
    
    if (incident) {
      Object.assign(incident, updates, { updatedAt: new Date().toISOString() });
      
      this.updateStats();
      
      // Broadcast update to all clients
      this.broadcastToAdmins('incident_updated', { incident });
      this.broadcastToTourists('incident_updated', { incident });
    }
  }

  handleAdminAction(ws, data) {
    const { action, targetId, details } = data;
    
    switch (action) {
      case 'send_alert':
        this.handleSendAlert(details);
        break;
      case 'update_tourist_status':
        this.handleUpdateTouristStatus(targetId, details);
        break;
      case 'emergency_broadcast':
        this.handleEmergencyBroadcast(details);
        break;
    }
  }

  handleLocationUpdate(ws, data) {
    const { latitude, longitude, accuracy } = data;
    const tourist = this.data.tourists.get(ws.userId);
    
    if (tourist) {
      tourist.location = {
        latitude,
        longitude,
        accuracy,
        timestamp: new Date().toISOString()
      };
      
      this.broadcastToAdmins('location_update', {
        touristId: ws.userId,
        location: tourist.location
      });
    }
  }

  handleSendAlert(details) {
    const alert = {
      id: uuidv4(),
      type: details.type || 'info',
      message: details.message,
      timestamp: new Date().toISOString()
    };
    
    this.data.systemAlerts.unshift(alert);
    if (this.data.systemAlerts.length > 50) {
      this.data.systemAlerts = this.data.systemAlerts.slice(0, 50);
    }
    
    this.broadcastToAdmins('system_alert', { alert });
    this.broadcastToTourists('system_alert', { alert });
  }

  handleUpdateTouristStatus(touristId, details) {
    const tourist = this.data.tourists.get(touristId);
    if (tourist) {
      Object.assign(tourist, details);
      this.broadcastToAdmins('tourist_updated', { tourist });
    }
  }

  handleEmergencyBroadcast(details) {
    const broadcast = {
      id: uuidv4(),
      message: details.message,
      type: 'emergency',
      timestamp: new Date().toISOString()
    };
    
    this.broadcastToTourists('emergency_broadcast', broadcast);
    this.broadcastToAdmins('emergency_broadcast_sent', broadcast);
  }

  updateStats() {
    this.data.stats = {
      activeTourists: this.data.tourists.size,
      activeIncidents: Array.from(this.data.incidents.values()).filter(i => i.status === 'active').length,
      reportsToday: Array.from(this.data.incidents.values()).filter(i => {
        const today = new Date().toDateString();
        return new Date(i.reportedAt).toDateString() === today;
      }).length,
      safetyScore: Math.max(50, 100 - (Array.from(this.data.incidents.values()).filter(i => i.status === 'active').length * 5))
    };
    
    this.broadcastToAdmins('stats_update', { stats: this.data.stats });
  }

  broadcastToAdmins(type, data) {
    const message = JSON.stringify({ type, ...data });
    this.clients.admins.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  broadcastToTourists(type, data) {
    const message = JSON.stringify({ type, ...data });
    this.clients.tourists.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  startDataSimulation() {
    // Simulate periodic system updates
    setInterval(() => {
      // Simulate random incidents
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        this.simulateRandomIncident();
      }
      
      // Update tourist locations
      this.simulateLocationUpdates();
      
      // Generate system alerts
      if (Math.random() < 0.05) { // 5% chance every 30 seconds
        this.simulateSystemAlert();
      }
    }, 30000);
  }

  simulateRandomIncident() {
    const types = ['Safety Concern', 'Medical Emergency', 'Lost Tourist', 'Theft Report'];
    const severities = ['Low', 'Medium', 'High'];
    const locations = ['Downtown Plaza', 'Tourist District', 'Central Park', 'Beach Area', 'Shopping Center'];
    
    const incident = {
      id: uuidv4(),
      type: types[Math.floor(Math.random() * types.length)],
      description: 'Automatically generated incident for demonstration',
      severity: severities[Math.floor(Math.random() * severities.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      status: 'active',
      reportedBy: 'system',
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.data.incidents.set(incident.id, incident);
    this.updateStats();
    this.broadcastToAdmins('new_incident', { incident });
  }

  simulateLocationUpdates() {
    this.data.tourists.forEach((tourist, touristId) => {
      if (tourist.location) {
        // Simulate small location changes
        const lat = tourist.location.latitude + (Math.random() - 0.5) * 0.001;
        const lng = tourist.location.longitude + (Math.random() - 0.5) * 0.001;
        
        tourist.location = {
          latitude: lat,
          longitude: lng,
          accuracy: 10 + Math.random() * 20,
          timestamp: new Date().toISOString()
        };
        
        this.broadcastToAdmins('location_update', {
          touristId,
          location: tourist.location
        });
      }
    });
  }

  simulateSystemAlert() {
    const alerts = [
      { type: 'info', message: 'System performance is optimal' },
      { type: 'warning', message: 'High traffic detected in tourist zones' },
      { type: 'success', message: 'Emergency response team deployed successfully' }
    ];
    
    const alert = alerts[Math.floor(Math.random() * alerts.length)];
    this.handleSendAlert(alert);
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`Tourist Safety WebSocket Server running on port ${this.port}`);
    });
  }
}

// Start the server
const server = new TouristSafetyWebSocketServer(8080);
server.start();

module.exports = TouristSafetyWebSocketServer;