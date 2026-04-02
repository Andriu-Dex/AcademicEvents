/**
 * Notification Context
 * Manages push notifications, permissions, and FCM token registration
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
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
import {
  isExternalNotificationLink,
  normalizeNotificationLink,
} from '../utils/notificationLink';

const ADMIN_ROLES = new Set([
  'ADMIN_GLOBAL',
  'ADMIN_GENERAL',
  'GLOBAL_ADMIN',
  'GENERAL_ADMIN',
]);

const normalizeRegistrationStatus = (status) =>
  typeof status === 'string' ? status.toUpperCase() : '';

const getUserInscriptionSocketNotification = (payload = {}) => {
  const rawData = payload.data || payload;
  const status = normalizeRegistrationStatus(rawData.estadoNuevo || rawData.status);
  const eventName = rawData.event?.name || rawData.event?.nom_eve || 'el evento';

  if (status === 'ACCEPTED') {
    return {
      title: '✅ Inscripción Aceptada',
      body: `Tu inscripción para "${eventName}" fue aceptada.`,
      data: {
        type: 'REGISTRATION_APPROVED',
        status,
        link: '/enrollments',
      },
    };
  }

  if (status === 'APPROVED') {
    return {
      title: '🎓 Inscripción Aprobada',
      body: `Tu inscripción para "${eventName}" fue aprobada de forma final.`,
      data: {
        type: 'REGISTRATION_APPROVED',
        status,
        link: '/enrollments',
      },
    };
  }

  if (status === 'REJECTED') {
    return {
      title: '❌ Inscripción Rechazada',
      body: `Tu inscripción para "${eventName}" fue rechazada.`,
      data: {
        type: 'REGISTRATION_REJECTED',
        status,
        link: '/enrollments',
      },
    };
  }

  if (
    status === 'FAILED_GRADE' ||
    status === 'FAILED_ATTENDANCE' ||
    status === 'FAILED_TOTAL'
  ) {
    return {
      title: '📋 Inscripción Finalizada',
      body: `Tu inscripción para "${eventName}" fue finalizada con resultado: ${status}.`,
      data: {
        type: 'SYSTEM_ALERT',
        status,
        link: '/enrollments',
      },
    };
  }

  return null;
};

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
  const { socket, isConnected } = useSocket();

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
      id: notification.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ...notification,
      read: false,
      timestamp: notification.timestamp || new Date().toISOString(),
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
              const targetLink = normalizeNotificationLink(payload.data?.link);
              if (targetLink) {
                if (isExternalNotificationLink(targetLink)) {
                  window.location.assign(targetLink);
                } else {
                  window.location.href = targetLink;
                }
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

  // Bridge Socket.IO notifications to bell panel (especially useful for online users/admins)
  useEffect(() => {
    if (!socket || !isConnected || !usuario) {
      return;
    }

    const userRole = usuario.rol_usu || usuario.role;
    const isAdmin = ADMIN_ROLES.has(userRole);

    const handleUserInscriptionUpdate = (payload) => {
      const notification = getUserInscriptionSocketNotification(payload);
      if (!notification) {
        return;
      }

      addForegroundNotification({
        ...notification,
        data: {
          ...notification.data,
          source: 'socket',
        },
        timestamp: payload?.timestamp || new Date().toISOString(),
      });
    };

    const handleAdminNotification = (payload) => {
      if (!isAdmin) {
        return;
      }

      const defaultLink = payload?.eventId
        ? `/admin/events/${payload.eventId}/enrollments`
        : '/admin/enrollments';

      addForegroundNotification({
        title: payload?.actionRequired
          ? '🛎️ Validación Pendiente'
          : '🔔 Notificación Administrativa',
        body:
          payload?.message ||
          'Tienes una nueva notificación administrativa.',
        data: {
          type: 'SYSTEM_ALERT',
          link: payload?.link || defaultLink,
          source: 'socket',
          actionRequired: Boolean(payload?.actionRequired),
        },
        timestamp: payload?.timestamp || new Date().toISOString(),
      });
    };

    socket.on('user-inscription-update', handleUserInscriptionUpdate);
    socket.on('admin-notification', handleAdminNotification);

    return () => {
      socket.off('user-inscription-update', handleUserInscriptionUpdate);
      socket.off('admin-notification', handleAdminNotification);
    };
  }, [socket, isConnected, usuario, addForegroundNotification]);

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
