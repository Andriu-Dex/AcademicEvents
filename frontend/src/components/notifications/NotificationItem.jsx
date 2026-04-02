/**
 * NotificationItem Component
 * Displays a single notification in the notification panel
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  Award,
  Calendar,
  Bell,
  CreditCard,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import {
  isExternalNotificationLink,
  normalizeNotificationLink,
} from '../../utils/notificationLink';

// Notification type icons and styles
const NOTIFICATION_STYLES = {
  REGISTRATION_CREATED: {
    icon: FileText,
    className: 'notification-info',
  },
  REGISTRATION_APPROVED: {
    icon: CheckCircle,
    className: 'notification-success',
  },
  REGISTRATION_REJECTED: {
    icon: XCircle,
    className: 'notification-error',
  },
  CERTIFICATE_READY: {
    icon: Award,
    className: 'notification-success',
  },
  EVENT_REMINDER_24H: {
    icon: Calendar,
    className: 'notification-warning',
  },
  EVENT_REMINDER_1H: {
    icon: Calendar,
    className: 'notification-warning',
  },
  EVENT_UPDATED: {
    icon: Bell,
    className: 'notification-info',
  },
  EVENT_CANCELLED: {
    icon: AlertTriangle,
    className: 'notification-error',
  },
  PAYMENT_APPROVED: {
    icon: CreditCard,
    className: 'notification-success',
  },
  PAYMENT_REJECTED: {
    icon: CreditCard,
    className: 'notification-error',
  },
  MOTIVATION_LETTER_APPROVED: {
    icon: FileText,
    className: 'notification-success',
  },
  MOTIVATION_LETTER_REJECTED: {
    icon: FileText,
    className: 'notification-error',
  },
  SYSTEM_ALERT: {
    icon: AlertTriangle,
    className: 'notification-warning',
  },
  DEFAULT: {
    icon: Bell,
    className: 'notification-info',
  },
};

/**
 * Format relative time in Spanish
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Formatted relative time
 */
const formatRelativeTime = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'Ahora';
  } else if (diffMinutes < 60) {
    return `Hace ${diffMinutes} min`;
  } else if (diffHours < 24) {
    return `Hace ${diffHours} h`;
  } else if (diffDays === 1) {
    return 'Ayer';
  } else if (diffDays < 7) {
    return `Hace ${diffDays} dias`;
  } else {
    return date.toLocaleDateString('es-EC', {
      day: 'numeric',
      month: 'short',
    });
  }
};

const NotificationItem = ({ notification, onClose, onMarkAsRead }) => {
  const navigate = useNavigate();

  // Get notification style based on type
  const type = notification.data?.type || notification.type || 'DEFAULT';
  const style = NOTIFICATION_STYLES[type] || NOTIFICATION_STYLES.DEFAULT;
  const IconComponent = style.icon;

  // Handle click on notification
  const handleClick = () => {
    // Mark as read
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead();
    }

    // Navigate to link if provided
    const targetLink = normalizeNotificationLink(notification.data?.link);
    if (targetLink) {
      onClose?.();

      if (isExternalNotificationLink(targetLink)) {
        window.location.assign(targetLink);
        return;
      }

      navigate(targetLink);
    }
  };

  return (
    <div
      className={`notification-item ${style.className} ${notification.read ? 'notification-read' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`${notification.title}: ${notification.body}`}
    >
      <div className="notification-item-icon">
        <IconComponent size={20} />
      </div>
      <div className="notification-item-content">
        <h4 className="notification-item-title">{notification.title}</h4>
        <p className="notification-item-body">{notification.body}</p>
        <span className="notification-item-time">{formatRelativeTime(notification.timestamp)}</span>
      </div>
      {!notification.read && <span className="notification-item-dot" aria-hidden="true" />}
    </div>
  );
};

export default NotificationItem;
