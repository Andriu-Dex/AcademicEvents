const admin = require('firebase-admin');
const path = require('path');

let firebaseApp = null;

/**
 * Initialize Firebase Admin SDK
 * Uses singleton pattern to avoid multiple initializations
 */
const initializeFirebase = () => {
  try {
    // Check if already initialized
    if (firebaseApp) {
      console.log('🔥 Firebase Admin SDK already initialized');
      return firebaseApp;
    }

    // Get service account path from environment
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json';
    const projectId = process.env.FIREBASE_PROJECT_ID;

    // Validate environment variables
    if (!projectId) {
      console.warn('⚠️ FIREBASE_PROJECT_ID not found in .env - Firebase disabled');
      return null;
    }

    // Resolve absolute path
    const absolutePath = path.resolve(process.cwd(), serviceAccountPath);

    // Check if service account file exists
    const fs = require('fs');
    if (!fs.existsSync(absolutePath)) {
      console.warn(`⚠️ Firebase service account file not found at: ${absolutePath}`);
      console.warn('⚠️ Push notifications will be disabled');
      return null;
    }

    // Load service account
    const serviceAccount = require(absolutePath);

    // Initialize Firebase Admin
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: projectId,
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log(`🔥 Project: ${projectId}`);

    return firebaseApp;
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error.message);

    if (process.env.NODE_ENV === 'development') {
      console.error('🔍 Stack trace:', error.stack);
    }

    return null;
  }
};

/**
 * Get Firebase Admin instance (lazy initialization)
 */
const getFirebaseAdmin = () => {
  if (!firebaseApp) {
    return initializeFirebase();
  }
  return firebaseApp;
};

/**
 * Get Firebase Messaging instance
 */
const getMessaging = () => {
  const app = getFirebaseAdmin();
  if (!app) {
    return null;
  }
  return admin.messaging(app);
};

/**
 * Check if Firebase is available
 */
const isFirebaseAvailable = () => {
  return firebaseApp !== null;
};

module.exports = {
  initializeFirebase,
  getFirebaseAdmin,
  getMessaging,
  isFirebaseAvailable,
};
