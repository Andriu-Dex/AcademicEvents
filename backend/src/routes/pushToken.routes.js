const express = require('express');
const {
  registerPushToken,
  deletePushToken,
  deleteAllPushTokens,
  getPushTokens,
  getPushTokenStatus,
  getNotificationHistory,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require('../controllers/pushToken.controller');
const verificarToken = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication (tenant middleware is applied globally in app.js)
router.use(verificarToken);

/**
 * @route   POST /api/push-token
 * @desc    Register or update push notification token
 * @access  Private
 * @body    { token: string, platform?: 'WEB'|'ANDROID'|'IOS', deviceInfo?: string }
 */
router.post('/push-token', registerPushToken);

/**
 * @route   GET /api/push-token
 * @desc    Get all push tokens for authenticated user
 * @access  Private
 */
router.get('/push-token', getPushTokens);

/**
 * @route   GET /api/push-token/status
 * @desc    Get push token status (has active tokens?)
 * @access  Private
 */
router.get('/push-token/status', getPushTokenStatus);

/**
 * @route   DELETE /api/push-token/:tokenId
 * @desc    Deactivate specific push token
 * @access  Private
 */
router.delete('/push-token/:tokenId', deletePushToken);

/**
 * @route   DELETE /api/push-token
 * @desc    Deactivate all push tokens (disable notifications)
 * @access  Private
 */
router.delete('/push-token', deleteAllPushTokens);

/**
 * @route   GET /api/notifications/history
 * @desc    Get notification history for authenticated user
 * @access  Private
 * @query   { limit?: number, offset?: number }
 */
router.get('/notifications/history', getNotificationHistory);

/**
 * @route   PATCH /api/notifications/:notificationId/read
 * @desc    Mark specific notification as read
 * @access  Private
 */
router.patch('/notifications/:notificationId/read', markNotificationAsRead);

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch('/notifications/read-all', markAllNotificationsAsRead);

module.exports = router;
