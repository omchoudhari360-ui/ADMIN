import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for WebSocket connection management
 * Handles real-time communication with the Tourist Safety server
 */

export const useWebSocket = (url = 'ws://localhost:8080') => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const { user, role } = useAuth();
  const ws = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const messageHandlers = useRef(new Map());

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(url);
      
      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        
        // Authenticate with server
        if (user && role) {
          ws.current.send(JSON.stringify({
            type: 'auth',
            role: role,
            userId: user.blockchainId || user.username,
            username: user.username
          }));
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          
          // Call registered handlers
          const handler = messageHandlers.current.get(data.type);
          if (handler) {
            handler(data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error occurred');
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setError('Failed to connect to server');
    }
  }, [url, user, role]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      return true;
    } else {
      console.warn('WebSocket is not connected');
      return false;
    }
  }, []);

  const subscribe = useCallback((messageType, handler) => {
    messageHandlers.current.set(messageType, handler);
    
    // Return unsubscribe function
    return () => {
      messageHandlers.current.delete(messageType);
    };
  }, []);

  // Tourist-specific methods
  const reportActivity = useCallback((activity, details) => {
    return sendMessage({
      type: 'tourist_activity',
      activity,
      details
    });
  }, [sendMessage]);

  const createIncident = useCallback((incidentData) => {
    return sendMessage({
      type: 'create_incident',
      ...incidentData
    });
  }, [sendMessage]);

  const updateLocation = useCallback((latitude, longitude, accuracy = 10) => {
    return sendMessage({
      type: 'location_update',
      latitude,
      longitude,
      accuracy
    });
  }, [sendMessage]);

  // Admin-specific methods
  const updateIncident = useCallback((incidentId, updates) => {
    return sendMessage({
      type: 'update_incident',
      incidentId,
      updates
    });
  }, [sendMessage]);

  const sendAdminAction = useCallback((action, targetId, details) => {
    return sendMessage({
      type: 'admin_action',
      action,
      targetId,
      details
    });
  }, [sendMessage]);

  const sendAlert = useCallback((alertType, message) => {
    return sendAdminAction('send_alert', null, {
      type: alertType,
      message
    });
  }, [sendAdminAction]);

  const sendEmergencyBroadcast = useCallback((message) => {
    return sendAdminAction('emergency_broadcast', null, { message });
  }, [sendAdminAction]);

  // Initialize connection
  useEffect(() => {
    if (user && role) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [user, role, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    subscribe,
    // Tourist methods
    reportActivity,
    createIncident,
    updateLocation,
    // Admin methods
    updateIncident,
    sendAdminAction,
    sendAlert,
    sendEmergencyBroadcast
  };
};

export default useWebSocket;