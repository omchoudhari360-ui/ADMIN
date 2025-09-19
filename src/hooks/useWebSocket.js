import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for WebSocket connection management
 * Handles real-time communication with the Tourist Safety server
 */

export const useWebSocket = (url = import.meta.env.VITE_WEBSOCKET_SERVER_URL || 'ws://localhost:8080') => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const { user, role } = useAuth();
  const ws = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const messageHandlers = useRef(new Map());

  const connect = useCallback(() => {
    // Don't attempt connection if we don't have user data
    if (!user || !role) {
      console.log('Waiting for user authentication before connecting to WebSocket');
      return;
    }

    try {
      console.log(`Attempting WebSocket connection as ${role}:`, url);
      ws.current = new WebSocket(url);
      
      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        setConnectionAttempts(0);
        
        // Authenticate with server
        const authMessage = {
          type: 'auth',
          role: role,
          userId: user.blockchainId || user.username,
          username: user.username
        };
        console.log('Sending auth message:', authMessage);
        ws.current.send(JSON.stringify(authMessage));
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received WebSocket message:', data.type, data);
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
        
        // Attempt to reconnect with exponential backoff
        if (connectionAttempts < 5) {
          const delay = Math.min(1000 * Math.pow(2, connectionAttempts), 10000);
          console.log(`Reconnecting in ${delay}ms (attempt ${connectionAttempts + 1})`);
          reconnectTimeoutRef.current = setTimeout(() => {
            setConnectionAttempts(prev => prev + 1);
            connect();
          }, delay);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError(`Connection error: ${error.message || 'Unknown error'}`);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setError(`Failed to connect to server: ${error.message}`);
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
    // Add a small delay to ensure user data is fully loaded
    const timer = setTimeout(() => {
      if (user && role) {
        connect();
      }
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      disconnect();
    };

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