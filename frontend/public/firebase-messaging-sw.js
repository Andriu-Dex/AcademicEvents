/**
 * Firebase Cloud Messaging Service Worker
 * Handles push notifications when the app is in background or closed
 */

// Import Firebase scripts (use compat version for service workers)
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

/**
 * Firebase configuration (hardcoded because Service Workers cannot access environment variables)
 *
 * IMPORTANT: These values are public Firebase configuration keys and are safe to include
 * in client-side code. However, they must be kept in sync with the configuration in:
 * - /frontend/src/config/firebase.config.js
 * - /frontend/.env (VITE_FIREBASE_* variables)
 *
 * Last updated: 2025-03-21
 * If you update Firebase project credentials, update ALL three locations above.
 */
const firebaseConfig = {
  apiKey: 'AIzaSyBn8DPGfWsNyJPSVtoafzdAhRm9_6FrXFg',
  authDomain: 'academicevents-fcm.firebaseapp.com',
  projectId: 'academicevents-fcm',
  storageBucket: 'academicevents-fcm.firebasestorage.app',
  messagingSenderId: '642182046070',
  appId: '1:642182046070:web:6caa9481c72d9190819a57',
};

// Initialize Firebase in the service worker
firebase.initializeApp(firebaseConfig);

// Get Firebase Messaging instance
const messaging = firebase.messaging();

/**
 * Handle background messages (when app is not in focus)
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  // Extract notification data
  const notificationTitle = payload.notification?.title || 'Academic Events';
  const notificationOptions = {
    body: payload.notification?.body || 'Tienes una nueva notificacion.',
    icon: payload.notification?.icon || '/Logo.png',
    badge: '/Logo.png',
    tag: payload.data?.type || 'default',
    data: {
      ...payload.data,
      clickAction: payload.data?.link || '/',
    },
    // Vibration pattern: vibrate 200ms, pause 100ms, vibrate 200ms
    vibrate: [200, 100, 200],
    // Auto-close after 10 seconds
    requireInteraction: false,
    // Actions for the notification (optional)
    actions: [
      {
        action: 'open',
        title: 'Ver',
      },
      {
        action: 'dismiss',
        title: 'Cerrar',
      },
    ],
  };

  // Show the notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * Handle notification click events
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);

  // Close the notification
  event.notification.close();

  // Handle action buttons
  if (event.action === 'dismiss') {
    return;
  }

  // Get the target URL from notification data
  const targetUrl = event.notification.data?.clickAction || event.notification.data?.link || '/';
  const urlToOpen = new URL(targetUrl, self.location.origin).href;

  // Focus existing window or open new one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there's already a window/tab open with our app
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          // Navigate to the target URL and focus the window
          return client.navigate(urlToOpen).then((client) => client?.focus());
        }
      }

      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

/**
 * Handle service worker installation
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installing...');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

/**
 * Handle service worker activation
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activated');
  // Claim all clients immediately
  event.waitUntil(clients.claim());
});

/**
 * Handle push events (fallback for raw push messages)
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received:', event);

  if (!event.data) {
    console.log('[SW] Push event has no data');
    return;
  }

  try {
    const payload = event.data.json();
    console.log('[SW] Push payload:', payload);

    // If FCM handles it, onBackgroundMessage will be called
    // This is a fallback for non-FCM push messages
  } catch (error) {
    console.error('[SW] Error parsing push payload:', error);
  }
});
