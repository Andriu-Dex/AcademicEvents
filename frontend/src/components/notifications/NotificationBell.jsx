/**
 * NotificationBell Component
 * Displays notification bell icon with unread count badge and dropdown panel
 * Integrates with backend notification history and foreground notifications
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, BellOff, Settings, CheckCheck, Trash2, X, Loader2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import {
  getNotificationHistory,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../services/notificationService';
import NotificationItem from './NotificationItem';
import './NotificationBell.css';

const NotificationBell = () => {
  const {
    isSupported,
    isLoading,
    isEnabled,
    permissionStatus,
    canRequestPermission,
    unreadCount: foregroundUnreadCount,
    foregroundNotifications,
    enableNotifications,
    disableNotifications,
    markAsRead: markForegroundAsRead,
    markAllAsRead: markAllForegroundAsRead,
    clearAllNotifications,
    isRegistering,
  } = useNotifications();

  const [showPanel, setShowPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const panelRef = useRef(null);
  const bellButtonRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Backend notification history state
  const [historyNotifications, setHistoryNotifications] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  /**
   * Load notification history from backend
   */
  const loadNotificationHistory = useCallback(async () => {
    if (!isEnabled || isLoadingHistory) return;

    setIsLoadingHistory(true);
    try {
      const result = await getNotificationHistory(50, 0);
      if (result.success && result.data) {
        // Transform backend notifications to match frontend format
        const transformed = result.data.notifications.map((n) => ({
          id: n.id,
          title: n.title,
          body: n.body,
          data: n.data || {},
          read: n.readAt !== null,
          timestamp: n.sentAt, // Backend uses sentAt field
          type: n.type,
          fromBackend: true,
        }));
        setHistoryNotifications(transformed);
        setHistoryLoaded(true);
      }
    } catch (error) {
      console.error('[NotificationBell] Error loading history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [isEnabled, isLoadingHistory]);

  /**
   * Merge foreground notifications with backend history
   * Frontend notifications take priority (shown first)
   */
  const allNotifications = React.useMemo(() => {
    // Create a Set of backend notification IDs to avoid duplicates
    const foregroundIds = new Set(foregroundNotifications.map((n) => n.id));

    // Filter out backend notifications that might be duplicates
    const uniqueHistory = historyNotifications.filter(
      (n) => !foregroundIds.has(n.id)
    );

    // Merge: foreground notifications first (newest), then history
    return [...foregroundNotifications, ...uniqueHistory];
  }, [foregroundNotifications, historyNotifications]);

  /**
   * Calculate total unread count (foreground + backend)
   */
  const totalUnreadCount = React.useMemo(() => {
    const backendUnread = historyNotifications.filter((n) => !n.read).length;
    return foregroundUnreadCount + backendUnread;
  }, [foregroundUnreadCount, historyNotifications]);

  useEffect(() => {
    const latestForegroundNotification = foregroundNotifications[0];

    if (!latestForegroundNotification) {
      return;
    }

    setLiveAnnouncement(
      `Nueva notificación: ${latestForegroundNotification.title}. ${latestForegroundNotification.body}`
    );
  }, [foregroundNotifications]);

  /**
   * Mark a notification as read (both local and backend)
   */
  const handleMarkAsRead = useCallback(async (notification) => {
    if (notification.fromBackend) {
      // Mark in backend
      const result = await markNotificationRead(notification.id);
      if (result.success) {
        setHistoryNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
      }
    } else {
      // Mark in local state
      markForegroundAsRead(notification.id);
    }
  }, [markForegroundAsRead]);

  /**
   * Mark all notifications as read (both local and backend)
   */
  const handleMarkAllAsRead = useCallback(async () => {
    // Mark all foreground as read
    markAllForegroundAsRead();

    // Mark all backend as read
    if (historyNotifications.some((n) => !n.read)) {
      const result = await markAllNotificationsRead();
      if (result.success) {
        setHistoryNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true }))
        );
      }
    }
  }, [markAllForegroundAsRead, historyNotifications]);

  /**
   * Clear all notifications (only local, backend history persists)
   */
  const handleClearAll = useCallback(() => {
    clearAllNotifications();
    // Don't clear backend history, just mark as read
    handleMarkAllAsRead();
  }, [clearAllNotifications, handleMarkAllAsRead]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowPanel(false);
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load notification history when panel opens and notifications are enabled
  useEffect(() => {
    if (showPanel && isEnabled && !historyLoaded && !showSettings) {
      loadNotificationHistory();
    }
  }, [showPanel, isEnabled, historyLoaded, showSettings, loadNotificationHistory]);

  // Reset history loaded flag when notifications are disabled/enabled
  useEffect(() => {
    if (!isEnabled) {
      setHistoryLoaded(false);
      setHistoryNotifications([]);
    }
  }, [isEnabled]);

  useEffect(() => {
    if (!showPanel) {
      return undefined;
    }

    requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handlePanelKeyDown = (event) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      setShowPanel(false);
      setShowSettings(false);
      requestAnimationFrame(() => {
        bellButtonRef.current?.focus();
      });
    };

    document.addEventListener("keydown", handlePanelKeyDown);

    return () => {
      document.removeEventListener("keydown", handlePanelKeyDown);
    };
  }, [showPanel]);

  // Handle bell click - Auto-enable on first click
  const handleBellClick = async () => {
    if (!isEnabled && canRequestPermission) {
      // First time: request permissions automatically
      const result = await enableNotifications();

      if (result.success) {
        // Wait for React state to update before opening panel
        setTimeout(() => {
          setShowPanel(true);
        }, 150);
      } else {
        // If permission was denied, show panel immediately with error state
        setShowPanel(true);
      }
    } else {
      setShowPanel(!showPanel);
      setShowSettings(false);
    }
  };

  // Toggle settings panel
  const handleToggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Handle enable/disable toggle
  const handleToggleNotifications = async () => {
    if (isEnabled) {
      await disableNotifications();
    } else {
      const result = await enableNotifications();
      if (result.success) {
        setShowSettings(false);
      }
    }
  };

  // Permission denied state
  if (permissionStatus === 'denied') {
    return (
      <div className="notification-bell-container" ref={panelRef}>
        <button
          className="notification-bell-button notification-bell-disabled"
          onClick={() => setShowPanel(!showPanel)}
          title="Notificaciones bloqueadas"
          aria-label="Notificaciones bloqueadas por el navegador"
        >
          <BellOff size={20} />
        </button>
        {showPanel && (
          <div className="notification-panel">
            <div className="notification-panel-header">
              <h3>Notificaciones bloqueadas</h3>
              <button
                className="notification-close-btn"
                onClick={() => setShowPanel(false)}
                aria-label="Cerrar panel"
              >
                <X size={18} />
              </button>
            </div>
            <div className="notification-blocked-message">
              <BellOff size={32} className="notification-blocked-icon" />
              <p>Las notificaciones han sido bloqueadas por tu navegador.</p>
              <p className="notification-blocked-hint">
                Para habilitarlas, haz clic en el icono de candado en la barra de direcciones y
                permite las notificaciones.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Loading state - show inactive bell while initializing
  if (isLoading) {
    return (
      <div className="notification-bell-container">
        <button
          className="notification-bell-button notification-bell-inactive"
          disabled
          title="Inicializando notificaciones..."
          aria-label="Inicializando notificaciones"
        >
          <Bell size={20} />
        </button>
      </div>
    );
  }

  // Not supported state - don't render
  if (!isSupported) {
    return null;
  }

  return (
    <div className="notification-bell-container" ref={panelRef}>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* Bell Button */}
      <button
        ref={bellButtonRef}
        className={`notification-bell-button ${isEnabled ? '' : 'notification-bell-inactive'}`}
        onClick={handleBellClick}
        title={isEnabled ? 'Ver notificaciones' : 'Activar notificaciones'}
        aria-label={
          isEnabled
            ? totalUnreadCount > 0
              ? `${totalUnreadCount} notificaciones nuevas`
              : 'Notificaciones, sin novedades'
            : 'Haz clic para activar notificaciones'
        }
        aria-haspopup="dialog"
        aria-expanded={showPanel}
        aria-controls="notification-panel"
      >
        <Bell size={20} />
        {isEnabled && totalUnreadCount > 0 && (
          <span
            className="notification-badge"
            aria-label={`${totalUnreadCount} notificaciones nuevas`}
          >
            {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div
          id="notification-panel"
          className="notification-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="notification-panel-title"
        >
          {/* Header */}
          <div className="notification-panel-header">
            <h3 id="notification-panel-title">Notificaciones</h3>
            <div className="notification-header-actions">
              {/* Settings - always visible */}
              <button
                className="notification-header-btn"
                onClick={handleToggleSettings}
                title="Configuración"
                aria-label="Configuración de notificaciones"
              >
                <Settings size={16} />
              </button>

              {/* Mark all as read - only if there are unread notifications */}
              {isEnabled && totalUnreadCount > 0 && (
                <button
                  className="notification-header-btn"
                  onClick={handleMarkAllAsRead}
                  title="Marcar todas como leídas"
                  aria-label="Marcar todas como leídas"
                >
                  <CheckCheck size={16} />
                </button>
              )}

              {/* Clear all - only if there are notifications */}
              {isEnabled && allNotifications.length > 0 && (
                <button
                  className="notification-header-btn notification-header-btn-danger"
                  onClick={handleClearAll}
                  title="Limpiar todas las notificaciones"
                  aria-label="Limpiar todas"
                >
                  <Trash2 size={16} />
                </button>
              )}

              {/* Close - always visible */}
              <button
                className="notification-close-btn"
                onClick={() => setShowPanel(false)}
                aria-label="Cerrar panel"
                ref={closeButtonRef}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="notification-settings">
              <div className="notification-settings-row">
                <span>Recibir notificaciones push</span>
                <button
                  className={`notification-toggle ${isEnabled ? 'active' : ''}`}
                  onClick={handleToggleNotifications}
                  disabled={isRegistering}
                  aria-pressed={isEnabled}
                  aria-label={isEnabled ? 'Desactivar notificaciones' : 'Activar notificaciones'}
                >
                  <span className="notification-toggle-slider" />
                </button>
              </div>
              {!isEnabled && canRequestPermission && (
                <p className="notification-settings-hint">
                  Activa las notificaciones para recibir alertas sobre tus inscripciones y eventos.
                </p>
              )}
            </div>
          )}

          {/* Notifications List */}
          {isEnabled && !showSettings && (
            <>
              {isLoadingHistory ? (
                <div className="notification-empty">
                  <Loader2 size={32} className="notification-loading-icon" />
                  <p>Cargando notificaciones...</p>
                </div>
              ) : allNotifications.length > 0 ? (
                <div className="notification-list">
                  {allNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClose={() => setShowPanel(false)}
                      onMarkAsRead={() => handleMarkAsRead(notification)}
                    />
                  ))}
                </div>
              ) : (
                <div className="notification-empty">
                  <Bell size={32} className="notification-empty-icon" />
                  <p>No tienes notificaciones</p>
                  <p className="notification-empty-hint">
                    Las notificaciones de tus inscripciones y eventos aparecerán aquí.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Not enabled state */}
          {!isEnabled && !showSettings && (
            <div className="notification-empty">
              <BellOff size={32} className="notification-empty-icon" />
              <p>Notificaciones desactivadas</p>
              <p className="notification-empty-hint">
                Usa el icono de configuración para activar las notificaciones.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
