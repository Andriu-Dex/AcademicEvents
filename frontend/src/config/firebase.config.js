/**
 * Firebase Configuration for Web SDK
 * Handles Firebase initialization and messaging setup
 */

import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// VAPID key for web push (public key)
export const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// Singleton Firebase app instance
let firebaseApp = null;
let messagingInstance = null;
let isSupportedCache = null; // Cache isSupported() result to avoid redundant browser API calls

/**
 * Initialize Firebase app (singleton pattern)
 * @returns {FirebaseApp|null} Firebase app instance or null if not configured
 */
export const initializeFirebaseApp = () => {
  try {
    // Check if Firebase is already initialized
    if (firebaseApp) {
      return firebaseApp;
    }

    // Check for existing Firebase apps
    const existingApps = getApps();
    if (existingApps.length > 0) {
      firebaseApp = existingApps[0];
      return firebaseApp;
    }

    // Validate configuration
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.warn('[Firebase] Configuration incomplete, Firebase will be disabled');
      return null;
    }

    // Initialize Firebase
    firebaseApp = initializeApp(firebaseConfig);
    console.log('[Firebase] App initialized successfully');

    return firebaseApp;
  } catch (error) {
    console.error('[Firebase] Error initializing app:', error);
    return null;
  }
};

/**
 * Get Firebase Messaging instance (lazy initialization)
 * @returns {Promise<Messaging|null>} Messaging instance or null if not supported
 */
export const getMessagingInstance = async () => {
  try {
    // Return cached instance if available
    if (messagingInstance) {
      return messagingInstance;
    }

    // Check if messaging is supported (use cache to avoid redundant browser API calls)
    if (isSupportedCache === null) {
      isSupportedCache = await isSupported();
    }
    const supported = isSupportedCache;

    if (!supported) {
      console.warn('[Firebase] Messaging not supported in this browser');
      return null;
    }

    // Initialize Firebase app if needed
    const app = initializeFirebaseApp();
    if (!app) {
      return null;
    }

    // Get messaging instance
    messagingInstance = getMessaging(app);
    console.log('[Firebase] Messaging instance created');

    return messagingInstance;
  } catch (error) {
    console.error('[Firebase] Error getting messaging instance:', error);
    return null;
  }
};

/**
 * Request permission and get FCM token
 * @returns {Promise<string|null>} FCM token or null if failed
 */
export const requestNotificationPermission = async () => {
  try {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('[Firebase] Notifications not supported in this browser');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    console.log('[Firebase] Notification permission:', permission);

    if (permission !== 'granted') {
      console.warn('[Firebase] Notification permission denied');
      return null;
    }

    // Get messaging instance
    const messaging = await getMessagingInstance();
    if (!messaging) {
      return null;
    }

    // Get FCM token with VAPID key
    const token = await getToken(messaging, {
      vapidKey: vapidKey,
    });

    if (token) {
      console.log('[Firebase] FCM token obtained successfully');
      return token;
    }

    console.warn('[Firebase] No FCM token available');
    return null;
  } catch (error) {
    console.error('[Firebase] Error requesting notification permission:', error);
    return null;
  }
};

/**
 * Set up foreground message handler
 * @param {Function} callback - Callback function to handle incoming messages
 * @returns {Function|null} Unsubscribe function or null if not available
 */
export const onForegroundMessage = async (callback) => {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) {
      return null;
    }

    // Set up message listener
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('[Firebase] Foreground message received:', payload);
      callback(payload);
    });

    return unsubscribe;
  } catch (error) {
    console.error('[Firebase] Error setting up foreground message handler:', error);
    return null;
  }
};

/**
 * Check if Firebase Messaging is available
 * @returns {Promise<boolean>}
 */
export const isFirebaseMessagingAvailable = async () => {
  try {
    // Check browser support
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      return false;
    }

    // Check Firebase support (use cache to avoid redundant browser API calls)
    if (isSupportedCache === null) {
      isSupportedCache = await isSupported();
    }
    const supported = isSupportedCache;

    return supported && !!firebaseConfig.apiKey;
  } catch (error) {
    console.error('[Firebase] Error checking availability:', error);
    return false;
  }
};

/**
 * Get current notification permission status
 * @returns {string} 'granted', 'denied', or 'default'
 */
export const getNotificationPermissionStatus = () => {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
};

/**
 * Delete FCM token (for logout or disabling notifications)
 * @returns {Promise<boolean>} True if deleted successfully
 */
export const deleteFCMToken = async () => {
  try {
    const { deleteToken } = await import('firebase/messaging');
    const messaging = await getMessagingInstance();

    if (!messaging) {
      return false;
    }

    await deleteToken(messaging);
    console.log('[Firebase] FCM token deleted');
    return true;
  } catch (error) {
    console.error('[Firebase] Error deleting FCM token:', error);
    return false;
  }
};

export default {
  initializeFirebaseApp,
  getMessagingInstance,
  requestNotificationPermission,
  onForegroundMessage,
  isFirebaseMessagingAvailable,
  getNotificationPermissionStatus,
  deleteFCMToken,
  vapidKey,
};
