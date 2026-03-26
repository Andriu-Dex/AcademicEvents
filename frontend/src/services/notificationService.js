/**
 * Notification Service
 * Handles API calls for push token management
 */

import axiosInstance from '../api/axiosConfig';

/**
 * Register FCM token with backend
 * @param {string} token - FCM token
 * @param {string} platform - Platform type ('WEB', 'ANDROID', 'IOS')
 * @param {string} deviceInfo - Optional device information
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const registerPushToken = async (token, platform = 'WEB', deviceInfo = null) => {
  try {
    // Get device info if not provided
    const info = deviceInfo || {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
    };

    const response = await axiosInstance.post('/push-token', {
      token,
      platform,
      deviceInfo: JSON.stringify(info),
    });

    console.log('[NotificationService] Token registered successfully');
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('[NotificationService] Error registering token:', error);
    return {
      success: false,
      statusCode: error.response?.status ?? null,
      error: error.response?.data?.message || error.message,
    };
  }
};

/**
 * Delete a specific FCM token
 * @param {string} tokenId - Token ID to delete
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deletePushToken = async (tokenId) => {
  try {
    await axiosInstance.delete(`/push-token/${tokenId}`);
    console.log('[NotificationService] Token deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('[NotificationService] Error deleting token:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

/**
 * Delete all FCM tokens for current user
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteAllPushTokens = async () => {
  try {
    await axiosInstance.delete('/push-token');
    console.log('[NotificationService] All tokens deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('[NotificationService] Error deleting all tokens:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

/**
 * Get all FCM tokens for current user
 * @returns {Promise<{success: boolean, data?: object[], error?: string}>}
 */
export const getPushTokens = async () => {
  try {
    const response = await axiosInstance.get('/push-token');
    return {
      success: true,
      data: response.data.data || [],
    };
  } catch (error) {
    console.error('[NotificationService] Error getting tokens:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

/**
 * Get FCM token status (for checking if notifications are enabled)
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getPushTokenStatus = async () => {
  try {
    const response = await axiosInstance.get('/push-token/status');
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error('[NotificationService] Error getting token status:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

/**
 * Check if current browser/device has an active token
 * @param {string} currentToken - Current FCM token to check
 * @returns {Promise<boolean>}
 */
export const isTokenRegistered = async (currentToken) => {
  try {
    const { success, data } = await getPushTokens();

    if (!success || !data) {
      return false;
    }

    return data.some((t) => t.token === currentToken && t.isActive);
  } catch (error) {
    console.error('[NotificationService] Error checking token registration:', error);
    return false;
  }
};

/**
 * Get notification history from backend
 * @param {number} limit - Maximum number of notifications to fetch
 * @param {number} offset - Number of notifications to skip
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getNotificationHistory = async (limit = 50, offset = 0) => {
  try {
    const response = await axiosInstance.get('/notifications/history', {
      params: { limit, offset },
    });
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    if (error.response?.status !== 429) {
      console.error('[NotificationService] Error getting notification history:', error);
    }
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - Notification ID to mark as read
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const markNotificationRead = async (notificationId) => {
  try {
    await axiosInstance.patch(`/notifications/${notificationId}/read`);
    return { success: true };
  } catch (error) {
    console.error('[NotificationService] Error marking notification as read:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const markAllNotificationsRead = async () => {
  try {
    const response = await axiosInstance.patch('/notifications/read-all');
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error('[NotificationService] Error marking all notifications as read:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export default {
  registerPushToken,
  deletePushToken,
  deleteAllPushTokens,
  getPushTokens,
  getPushTokenStatus,
  isTokenRegistered,
  getNotificationHistory,
  markNotificationRead,
  markAllNotificationsRead,
};
