/**
 * Notification Context
 * Manages push notifications, permissions, and FCM token registration
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import {
  initializeFirebaseApp,
  requestNotificationPermission,
  onForegroundMessage,
  isFirebaseMessagingAvailable,
  getNotificationPermissionStatus,
  deleteFCMToken,
} from '../config/firebase.config';
import {
  registerPushToken,
  deleteAllPushTokens,
} from '../services/notificationService';

// Create context
const NotificationContext = createContext();

// Custom hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe ser usado dentro de un NotificationProvider');
  }
  return context;
};

// Notification Provider component
export const NotificationProvider = ({ children }) => {
  const { usuario, token: authToken } = useAuth();

  // State
  const [fcmToken, setFcmToken] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [foregroundNotifications, setForegroundNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRegistering, setIsRegistering] = useState(false);

  // Check if service worker is registered
  const [swRegistered, setSwRegistered] = useState(false);

  /**
   * Register Service Worker for FCM
   */
  const registerServiceWorker = useCallback(async () => {
    try {
      if (!('serviceWorker' in navigator)) {
        console.warn('[NotificationContext] Service workers not supported');
        return false;
      }

      // Check for existing registration
      const existingReg = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
      if (existingReg) {
        console.log('[NotificationContext] Service Worker already registered');
        setSwRegistered(true);
        return true;
      }

      // Register new service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/',
      });

      console.log('[NotificationContext] Service Worker registered:', registration.scope);
      setSwRegistered(true);
      return true;
    } catch (error) {
      console.error('[NotificationContext] Service Worker registration failed:', error);
      return false;
    }
  }, []);

  /**
   * Initialize notification system
   */
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);

      // Run Firebase availability check and Service Worker registration in parallel
      const [available] = await Promise.all([
        isFirebaseMessagingAvailable(),
        registerServiceWorker(),
      ]);

      setIsSupported(available);

      if (!available) {
        console.log('[NotificationContext] Firebase Messaging not available');
        setIsLoading(false);
        return;
      }

      // Initialize Firebase app
      initializeFirebaseApp();

      // Get current permission status
      const status = getNotificationPermissionStatus();
      setPermissionStatus(status);

      // If permissions are already granted, get the existing token
      if (status === 'granted') {
        try {
          console.log('[NotificationContext] Permissions already granted, getting existing token...');
          const token = await requestNotificationPermission();

          if (token) {
            setFcmToken(token);
            console.log('[NotificationContext] Existing token retrieved successfully');

            // Register token with backend if user is authenticated
            if (authToken && usuario) {
              registerPushToken(token).catch((err) => {
                console.error('[NotificationContext] Error registering token on init:', err);
              });
            }
          }
        } catch (error) {
          console.error('[NotificationContext] Error getting existing token:', error);
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('[NotificationContext] Initialization error:', error);
      setIsLoading(false);
    }
  }, [registerServiceWorker, authToken, usuario]);

  /**
   * Request notification permission and register FCM token
   */
  const enableNotifications = useCallback(async () => {
    if (!isSupported || isRegistering) {
      return { success: false, error: 'Notificaciones no soportadas' };
    }

    try {
      setIsRegistering(true);

      // Ensure service worker is registered
      if (!swRegistered) {
        const swResult = await registerServiceWorker();
        if (!swResult) {
          setIsRegistering(false);
          return { success: false, error: 'No se pudo registrar el Service Worker' };
        }
      }

      // Request permission and get FCM token
      const token = await requestNotificationPermission();

      if (!token) {
        setPermissionStatus(getNotificationPermissionStatus());
        setIsRegistering(false);
        return { success: false, error: 'Permiso denegado o token no disponible' };
      }

      setFcmToken(token);
      setPermissionStatus('granted');

      // Register token with backend if user is authenticated
      if (authToken && usuario) {
        const result = await registerPushToken(token);

        if (!result.success) {
          console.error('[NotificationContext] Failed to register token with backend');
          toast.warning('Las notificaciones fueron habilitadas pero no se registraron correctamente. Por favor intenta de nuevo.');
        } else {
          console.log('[NotificationContext] Token registered with backend');
        }
      }

      setIsRegistering(false);
      return { success: true, token };
    } catch (error) {
      console.error('[NotificationContext] Error enabling notifications:', error);
      setIsRegistering(false);
      return { success: false, error: error.message };
    }
  }, [isSupported, isRegistering, swRegistered, authToken, usuario, registerServiceWorker]);

  /**
   * Disable notifications and delete tokens
   */
  const disableNotifications = useCallback(async () => {
    try {
      // Delete from backend
      if (authToken) {
        await deleteAllPushTokens();
      }

      // Delete FCM token
      await deleteFCMToken();

      setFcmToken(null);
      toast.info('Las notificaciones han sido desactivadas');

      return { success: true };
    } catch (error) {
      console.error('[NotificationContext] Error disabling notifications:', error);
      return { success: false, error: error.message };
    }
  }, [authToken]);

  /**
   * Add foreground notification to list
   */
  const addForegroundNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      ...notification,
      read: false,
      timestamp: new Date().toISOString(),
    };

    setForegroundNotifications((prev) => [newNotification, ...prev].slice(0, 50)); // Keep last 50
    setUnreadCount((prev) => prev + 1);
  }, []);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback((notificationId) => {
    setForegroundNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(() => {
    setForegroundNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  /**
   * Clear all notifications
   */
  const clearAllNotifications = useCallback(() => {
    setForegroundNotifications([]);
    setUnreadCount(0);
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Set up foreground message handler
  useEffect(() => {
    if (!isSupported || permissionStatus !== 'granted') {
      return;
    }

    let unsubscribe = null;

    const setupForegroundHandler = async () => {
      unsubscribe = await onForegroundMessage((payload) => {
        console.log('[NotificationContext] Foreground message:', payload);

        // Add to notifications list
        addForegroundNotification({
          title: payload.notification?.title || 'Nueva notificacion',
          body: payload.notification?.body || '',
          data: payload.data,
        });

        // Show toast notification
        toast.info(
          <div>
            <strong>{payload.notification?.title}</strong>
            <p style={{ margin: 0, fontSize: '0.9em' }}>{payload.notification?.body}</p>
          </div>,
          {
            autoClose: 5000,
            onClick: () => {
              // Navigate to link if provided
              if (payload.data?.link) {
                window.location.href = payload.data.link;
              }
            },
          }
        );
      });
    };

    setupForegroundHandler();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isSupported, permissionStatus, addForegroundNotification]);

  // Re-register token when user logs in
  useEffect(() => {
    if (authToken && usuario && fcmToken) {
      console.log('[NotificationContext] User authenticated, registering token...');
      registerPushToken(fcmToken).catch((err) => {
        console.error('[NotificationContext] Error registering token on login:', err);
      });
    }
  }, [authToken, usuario, fcmToken]);

  // Context value
  const value = {
    // State
    fcmToken,
    permissionStatus,
    isSupported,
    isLoading,
    isRegistering,
    swRegistered,
    foregroundNotifications,
    unreadCount,

    // Computed
    isEnabled: permissionStatus === 'granted' && !!fcmToken,
    canRequestPermission: permissionStatus === 'default' && isSupported,

    // Actions
    enableNotifications,
    disableNotifications,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,

    // For debugging
    refreshStatus: initialize,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export default NotificationContext;
