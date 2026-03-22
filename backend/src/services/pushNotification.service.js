const { getMessaging, isFirebaseAvailable } = require('../config/firebase.config');
const { PrismaClient } = require('@prisma/client');
const socketService = require('./socket.service');

const prisma = new PrismaClient();

/**
 * Send push notification to a specific FCM token
 * @param {string} fcmToken - Firebase Cloud Messaging token
 * @param {object} notification - { title: string, body: string, imageUrl?: string }
 * @param {object} data - Additional data payload (eventId, inscriptionId, etc.)
 * @param {number} retryCount - Current retry attempt (internal use)
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
const sendPushNotification = async (fcmToken, notification, data = {}, retryCount = 0) => {
  try {
    // Check if Firebase is available
    if (!isFirebaseAvailable()) {
      console.warn('⚠️ Firebase not available, skipping push notification');
      return { success: false, error: 'Firebase not initialized' };
    }

    const messaging = getMessaging();
    if (!messaging) {
      return { success: false, error: 'Messaging not available' };
    }

    // Build FCM message
    const message = {
      token: fcmToken,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        ...data,
        // Convert all data values to strings (FCM requirement)
        clickAction: data.clickAction || 'FLUTTER_NOTIFICATION_CLICK',
        timestamp: new Date().toISOString(),
      },
      webpush: {
        notification: {
          icon: notification.imageUrl || '/Logo.png',
          badge: '/Logo.png',
          requireInteraction: false,
        },
        fcmOptions: {
          link: data.link || '/',
        },
      },
    };

    // Add image if provided
    if (notification.imageUrl) {
      message.notification.image = notification.imageUrl;
    }

    // Send message
    const response = await messaging.send(message);

    console.log('✅ Push notification sent successfully:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('❌ Error sending push notification:', error.message);

    // Handle specific FCM errors - check both error.code and error.message
    const isInvalidToken =
      error.code === 'messaging/registration-token-not-registered' ||
      error.code === 'messaging/invalid-registration-token' ||
      error.message?.includes('not a valid FCM registration token') ||
      error.message?.includes('Requested entity was not found') ||
      error.message?.includes('registration-token-not-registered');

    if (isInvalidToken) {
      console.warn('🗑️ Invalid token detected, marking for removal from database');
      return { success: false, error: 'INVALID_TOKEN', shouldInvalidate: true };
    }

    // Retry logic (max 3 attempts) - only for transient errors
    if (retryCount < 2) {
      console.log(`🔄 Retrying... (attempt ${retryCount + 2}/3)`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
      return sendPushNotification(fcmToken, notification, data, retryCount + 1);
    }

    return { success: false, error: error.message };
  }
};

/**
 * Send push notification to a specific user (finds their active tokens)
 * @param {string} accountId - Account UUID
 * @param {string} tenantId - Tenant UUID
 * @param {object} notification - Notification object
 * @param {object} data - Additional data
 * @returns {Promise<{success: boolean, sentCount: number, failedCount: number}>}
 */
const sendPushNotificationToUser = async (accountId, tenantId, notification, data = {}) => {
  try {
    // Check if user is online (avoid duplicates with Socket.IO)
    const isOnline = socketService.isUserOnline ? socketService.isUserOnline(accountId) : false;

    if (isOnline) {
      console.log(`ℹ️ User ${accountId} is online, skipping push notification (Socket.IO will handle it)`);
      return { success: true, sentCount: 0, failedCount: 0, skipped: true };
    }

    // Get all active tokens for this user
    const tokens = await prisma.pushToken.findMany({
      where: {
        accountId,
        tenantId,
        isActive: true,
      },
    });

    if (tokens.length === 0) {
      console.log(`ℹ️ No active tokens found for user ${accountId}`);
      return { success: false, sentCount: 0, failedCount: 0, error: 'NO_TOKENS' };
    }

    // Send to all tokens
    const results = await Promise.allSettled(
      tokens.map(tokenRecord =>
        sendPushNotification(tokenRecord.token, notification, data)
      )
    );

    // Process results and invalidate bad tokens
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const tokenRecord = tokens[i];

      if (result.status === 'fulfilled' && result.value.success) {
        sentCount++;

        // Update lastUsedAt
        await prisma.pushToken.update({
          where: { id: tokenRecord.id },
          data: { lastUsedAt: new Date() },
        }).catch(err => console.error('Error updating lastUsedAt:', err));
      } else {
        failedCount++;

        // Invalidate token if FCM says it's bad
        if (result.value?.shouldInvalidate) {
          console.log(`🗑️ Invalidating token ${tokenRecord.id}`);
          await prisma.pushToken.update({
            where: { id: tokenRecord.id },
            data: { isActive: false },
          }).catch(err => console.error('Error invalidating token:', err));
        }
      }
    }

    // Log notification to database
    try {
      await prisma.pushNotificationLog.create({
        data: {
          tenantId,
          accountId,
          title: notification.title,
          body: notification.body,
          type: data.type || 'SYSTEM_ALERT',
          data: data,
          status: sentCount > 0 ? 'SENT' : 'FAILED',
        },
      });
    } catch (logError) {
      console.error('Error logging notification:', logError);
    }

    console.log(`📊 Push notification results: ${sentCount} sent, ${failedCount} failed`);
    return { success: sentCount > 0, sentCount, failedCount };
  } catch (error) {
    console.error('❌ Error in sendPushNotificationToUser:', error);
    return { success: false, sentCount: 0, failedCount: 0, error: error.message };
  }
};

/**
 * Send push notification to multiple users (batch)
 * @param {string[]} accountIds - Array of account UUIDs
 * @param {string} tenantId - Tenant UUID
 * @param {object} notification - Notification object
 * @param {object} data - Additional data
 * @returns {Promise<{success: boolean, totalSent: number, totalFailed: number}>}
 */
const sendPushNotificationToMultipleUsers = async (accountIds, tenantId, notification, data = {}) => {
  try {
    const results = await Promise.allSettled(
      accountIds.map(accountId =>
        sendPushNotificationToUser(accountId, tenantId, notification, data)
      )
    );

    const totalSent = results.reduce((sum, r) =>
      sum + (r.status === 'fulfilled' ? r.value.sentCount : 0), 0
    );
    const totalFailed = results.reduce((sum, r) =>
      sum + (r.status === 'fulfilled' ? r.value.failedCount : 0), 0
    );

    console.log(`📊 Batch notification: ${totalSent} sent, ${totalFailed} failed to ${accountIds.length} users`);
    return { success: totalSent > 0, totalSent, totalFailed };
  } catch (error) {
    console.error('❌ Error in sendPushNotificationToMultipleUsers:', error);
    return { success: false, totalSent: 0, totalFailed: 0, error: error.message };
  }
};

/**
 * Send push notification to all users with a specific role
 * @param {string} tenantId - Tenant UUID
 * @param {string} role - User role (GLOBAL_ADMIN, GENERAL_ADMIN, STUDENT, GENERAL)
 * @param {object} notification - Notification object
 * @param {object} data - Additional data
 * @returns {Promise<{success: boolean, totalSent: number, totalFailed: number}>}
 */
const sendPushNotificationToRole = async (tenantId, role, notification, data = {}) => {
  try {
    // Get all accounts with this role
    const accounts = await prisma.account.findMany({
      where: {
        tenantId,
        role,
      },
      select: {
        id: true,
      },
    });

    if (accounts.length === 0) {
      console.log(`ℹ️ No users found with role ${role} in tenant ${tenantId}`);
      return { success: false, totalSent: 0, totalFailed: 0, error: 'NO_USERS' };
    }

    const accountIds = accounts.map(acc => acc.id);
    return sendPushNotificationToMultipleUsers(accountIds, tenantId, notification, data);
  } catch (error) {
    console.error('❌ Error in sendPushNotificationToRole:', error);
    return { success: false, totalSent: 0, totalFailed: 0, error: error.message };
  }
};

/**
 * Build notification payload based on type
 * @param {string} type - Notification type (from NotificationType enum)
 * @param {object} data - Context data (event, inscription, etc.)
 * @returns {object} - { notification: {title, body, imageUrl}, data: {...} }
 */
const buildNotificationPayload = (type, data) => {
  const payloads = {
    REGISTRATION_CREATED: {
      notification: {
        title: '📝 Inscripción Registrada',
        body: `Tu inscripción al evento "${data.eventName}" ha sido registrada exitosamente.`,
        imageUrl: data.eventImageUrl,
      },
      data: {
        type,
        eventId: data.eventId,
        inscriptionId: data.inscriptionId,
        link: `/mis-inscripciones`,
      },
    },
    REGISTRATION_APPROVED: {
      notification: {
        title: '✅ Inscripción Aprobada',
        body: `Tu inscripción al evento "${data.eventName}" ha sido aprobada.`,
        imageUrl: data.eventImageUrl,
      },
      data: {
        type,
        eventId: data.eventId,
        inscriptionId: data.inscriptionId,
        link: `/mis-inscripciones`,
      },
    },
    REGISTRATION_REJECTED: {
      notification: {
        title: '❌ Inscripción Rechazada',
        body: `Tu inscripción al evento "${data.eventName}" ha sido rechazada. ${data.reason || ''}`,
        imageUrl: data.eventImageUrl,
      },
      data: {
        type,
        eventId: data.eventId,
        inscriptionId: data.inscriptionId,
        link: `/mis-inscripciones`,
      },
    },
    CERTIFICATE_READY: {
      notification: {
        title: '🎓 Certificado Disponible',
        body: `Tu certificado del evento "${data.eventName}" está listo para descargar.`,
        imageUrl: data.eventImageUrl,
      },
      data: {
        type,
        eventId: data.eventId,
        certificateId: data.certificateId,
        link: `/certificados/${data.certificateId}`,
      },
    },
    EVENT_REMINDER_24H: {
      notification: {
        title: '⏰ Recordatorio: Evento Mañana',
        body: `El evento "${data.eventName}" comienza mañana a las ${data.eventTime}.`,
        imageUrl: data.eventImageUrl,
      },
      data: {
        type,
        eventId: data.eventId,
        link: `/eventos/${data.eventId}`,
      },
    },
    EVENT_REMINDER_1H: {
      notification: {
        title: '⏰ Recordatorio: Evento en 1 Hora',
        body: `El evento "${data.eventName}" comienza en 1 hora.`,
        imageUrl: data.eventImageUrl,
      },
      data: {
        type,
        eventId: data.eventId,
        link: `/eventos/${data.eventId}`,
      },
    },
    EVENT_UPDATED: {
      notification: {
        title: '📢 Evento Actualizado',
        body: `El evento "${data.eventName}" en el que estás inscrito ha sido actualizado.`,
        imageUrl: data.eventImageUrl,
      },
      data: {
        type,
        eventId: data.eventId,
        link: `/eventos/${data.eventId}`,
      },
    },
    EVENT_CANCELLED: {
      notification: {
        title: '🚫 Evento Cancelado',
        body: `El evento "${data.eventName}" ha sido cancelado.`,
        imageUrl: data.eventImageUrl,
      },
      data: {
        type,
        eventId: data.eventId,
        link: `/mis-inscripciones`,
      },
    },
    PAYMENT_APPROVED: {
      notification: {
        title: '💰 Pago Aprobado',
        body: `Tu pago para el evento "${data.eventName}" ha sido aprobado.`,
      },
      data: {
        type,
        eventId: data.eventId,
        inscriptionId: data.inscriptionId,
        link: `/mis-inscripciones`,
      },
    },
    PAYMENT_REJECTED: {
      notification: {
        title: '❌ Pago Rechazado',
        body: `Tu pago para el evento "${data.eventName}" ha sido rechazado. ${data.reason || ''}`,
      },
      data: {
        type,
        eventId: data.eventId,
        inscriptionId: data.inscriptionId,
        link: `/mis-inscripciones`,
      },
    },
    SYSTEM_ALERT: {
      notification: {
        title: data.title || '⚠️ Alerta del Sistema',
        body: data.message || 'Tienes una nueva notificación.',
      },
      data: {
        type,
        link: data.link || '/',
      },
    },
  };

  return payloads[type] || payloads.SYSTEM_ALERT;
};

module.exports = {
  sendPushNotification,
  sendPushNotificationToUser,
  sendPushNotificationToMultipleUsers,
  sendPushNotificationToRole,
  buildNotificationPayload,
};
