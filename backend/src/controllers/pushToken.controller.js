const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Register or update push notification token for the authenticated user
 * @route POST /api/push-token
 * @access Private
 */
const registerPushToken = async (req, res) => {
  try {
    const { token, platform = 'WEB', deviceInfo } = req.body;
    const accountId = req.usuario.id; // From verificarToken middleware
    const tenantId = req.tenantId; // From tenantMiddleware

    // Validate required fields
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido',
      });
    }

    // Validate platform
    const validPlatforms = ['WEB', 'ANDROID', 'IOS'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        message: 'Plataforma inválida. Debe ser WEB, ANDROID o IOS',
      });
    }

    // Use upsert to handle both create and update atomically
    // This prevents race conditions and duplicate key errors
    const savedToken = await prisma.pushToken.upsert({
      where: {
        token, // Unique constraint is on token field
      },
      update: {
        // If token exists, update these fields
        isActive: true,
        lastUsedAt: new Date(),
        deviceInfo: deviceInfo || undefined,
        // Also update tenantId and accountId in case user switched accounts
        tenantId,
        accountId,
      },
      create: {
        // If token doesn't exist, create new record
        tenantId,
        accountId,
        token,
        platform,
        deviceInfo,
        lastUsedAt: new Date(),
      },
      select: {
        id: true,
        platform: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Token registrado exitosamente',
      data: savedToken,
    });
  } catch (error) {
    console.error('Error registering push token:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al registrar token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Delete specific push token for the authenticated user
 * @route DELETE /api/push-token/:tokenId
 * @access Private
 */
const deletePushToken = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const accountId = req.usuario.id;
    const tenantId = req.tenantId;

    // Verify token exists and belongs to this account
    const token = await prisma.pushToken.findFirst({
      where: {
        id: tokenId,
        accountId,
        tenantId,
      },
    });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token no encontrado',
      });
    }

    // Soft delete: mark as inactive instead of deleting
    await prisma.pushToken.update({
      where: { id: tokenId },
      data: { isActive: false },
    });

    return res.status(200).json({
      success: true,
      message: 'Token desactivado exitosamente',
    });
  } catch (error) {
    console.error('Error deleting push token:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al eliminar token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Delete all push tokens for the authenticated user (disable notifications)
 * @route DELETE /api/push-token
 * @access Private
 */
const deleteAllPushTokens = async (req, res) => {
  try {
    const accountId = req.usuario.id;
    const tenantId = req.tenantId;

    // Deactivate all tokens for this account
    const result = await prisma.pushToken.updateMany({
      where: {
        accountId,
        tenantId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Todos los tokens desactivados exitosamente',
      data: {
        deactivatedCount: result.count,
      },
    });
  } catch (error) {
    console.error('Error deleting all push tokens:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al eliminar tokens',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get all push tokens for the authenticated user
 * @route GET /api/push-token
 * @access Private
 */
const getPushTokens = async (req, res) => {
  try {
    const accountId = req.usuario.id;
    const tenantId = req.tenantId;

    const tokens = await prisma.pushToken.findMany({
      where: {
        accountId,
        tenantId,
      },
      select: {
        id: true,
        platform: true,
        deviceInfo: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastUsedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        tokens,
        activeCount: tokens.filter((t) => t.isActive).length,
        totalCount: tokens.length,
      },
    });
  } catch (error) {
    console.error('Error getting push tokens:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al obtener tokens',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get push token status (has active tokens?)
 * @route GET /api/push-token/status
 * @access Private
 */
const getPushTokenStatus = async (req, res) => {
  try {
    const accountId = req.usuario.id;
    const tenantId = req.tenantId;

    const activeTokenCount = await prisma.pushToken.count({
      where: {
        accountId,
        tenantId,
        isActive: true,
      },
    });

    const latestToken = await prisma.pushToken.findFirst({
      where: {
        accountId,
        tenantId,
        isActive: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        platform: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        hasActiveTokens: activeTokenCount > 0,
        activeTokenCount,
        latestToken: latestToken || null,
      },
    });
  } catch (error) {
    console.error('Error getting push token status:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al obtener estado de tokens',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get notification history for the authenticated user
 * @route GET /api/notifications/history
 * @access Private
 */
const getNotificationHistory = async (req, res) => {
  try {
    const accountId = req.usuario.id;
    const tenantId = req.tenantId;
    const { limit = 50, offset = 0 } = req.query;

    const notifications = await prisma.pushNotificationLog.findMany({
      where: {
        accountId,
        tenantId,
      },
      select: {
        id: true,
        title: true,
        body: true,
        type: true,
        data: true,
        status: true,
        sentAt: true,
        readAt: true,
      },
      orderBy: {
        sentAt: 'desc',
      },
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10),
    });

    const unreadCount = await prisma.pushNotificationLog.count({
      where: {
        accountId,
        tenantId,
        readAt: null,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        total: notifications.length,
      },
    });
  } catch (error) {
    console.error('Error getting notification history:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al obtener historial de notificaciones',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Mark notification as read
 * @route PATCH /api/notifications/:notificationId/read
 * @access Private
 */
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const accountId = req.usuario.id;
    const tenantId = req.tenantId;

    const notification = await prisma.pushNotificationLog.findFirst({
      where: {
        id: notificationId,
        accountId,
        tenantId,
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada',
      });
    }

    await prisma.pushNotificationLog.update({
      where: { id: notificationId },
      data: { readAt: new Date(), status: 'READ' },
    });

    return res.status(200).json({
      success: true,
      message: 'Notificación marcada como leída',
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al marcar notificación como leída',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Mark all notifications as read
 * @route PATCH /api/notifications/read-all
 * @access Private
 */
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const accountId = req.usuario.id;
    const tenantId = req.tenantId;

    const result = await prisma.pushNotificationLog.updateMany({
      where: {
        accountId,
        tenantId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
        status: 'READ',
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas',
      data: {
        updatedCount: result.count,
      },
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al marcar notificaciones como leídas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  registerPushToken,
  deletePushToken,
  deleteAllPushTokens,
  getPushTokens,
  getPushTokenStatus,
  getNotificationHistory,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
