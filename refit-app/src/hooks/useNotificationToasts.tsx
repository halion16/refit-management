import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useNotifications } from './useNotifications';
import { playNotificationSound } from '@/lib/notificationSounds';
import type { Notification } from '@/types';

/**
 * Hook to display toast notifications for new unread notifications
 * Automatically shows toasts when new notifications arrive
 */
export function useNotificationToasts() {
  const { notifications } = useNotifications();
  const previousCountRef = useRef(0);
  const shownNotificationIdsRef = useRef(new Set<string>());

  useEffect(() => {
    const unreadNotifications = notifications.filter((n) => !n.read);

    // Find new notifications that haven't been shown as toast
    const newNotifications = unreadNotifications.filter(
      (n) => !shownNotificationIdsRef.current.has(n.id)
    );

    // Show toast for each new notification
    newNotifications.forEach((notification) => {
      showNotificationToast(notification);
      shownNotificationIdsRef.current.add(notification.id);

      // Play sound for the notification
      playNotificationSound(notification.priority);
    });

    // Clean up old notification IDs (keep last 100)
    if (shownNotificationIdsRef.current.size > 100) {
      const idsArray = Array.from(shownNotificationIdsRef.current);
      shownNotificationIdsRef.current = new Set(idsArray.slice(-100));
    }

    previousCountRef.current = unreadNotifications.length;
  }, [notifications]);

  return null;
}

/**
 * Display a toast notification based on notification type and priority
 */
function showNotificationToast(notification: Notification) {
  const { type, priority, title, message } = notification;

  // Determine toast variant based on priority
  const isUrgent = priority === 'urgent';
  const isHigh = priority === 'high';

  // Prepare toast content
  const content = (
    <div className="flex flex-col gap-1">
      <div className="font-semibold text-sm">{title}</div>
      <div className="text-xs text-gray-600">{message}</div>
    </div>
  );

  // Custom styles based on notification type
  const customStyle: Record<string, any> = {
    borderLeft: `4px solid ${getTypeColor(type)}`,
  };

  // Show appropriate toast based on priority
  if (isUrgent) {
    toast.error(content, {
      duration: 8000, // Longer duration for urgent
      style: customStyle,
      icon: getTypeIcon(type),
    });
  } else if (isHigh) {
    toast(content, {
      duration: 6000,
      style: {
        ...customStyle,
        borderLeftColor: '#f59e0b', // Orange for high priority
      },
      icon: getTypeIcon(type),
    });
  } else {
    toast(content, {
      duration: 5000,
      style: customStyle,
      icon: getTypeIcon(type),
    });
  }
}

/**
 * Get color for notification type
 */
function getTypeColor(type: Notification['type']): string {
  const colors: Record<Notification['type'], string> = {
    task_assigned: '#3b82f6',
    task_completed: '#10b981',
    task_overdue: '#ef4444',
    project_update: '#8b5cf6',
    deadline_approaching: '#f59e0b',
    budget_alert: '#ef4444',
    team_mention: '#06b6d4',
    document_uploaded: '#6366f1',
    comment_added: '#8b5cf6',
    appointment_reminder: '#f59e0b',
    system: '#6b7280',
  };

  return colors[type] || '#6b7280';
}

/**
 * Get emoji icon for notification type
 */
function getTypeIcon(type: Notification['type']): string {
  const icons: Record<Notification['type'], string> = {
    task_assigned: '📋',
    task_completed: '✅',
    task_overdue: '⚠️',
    project_update: '📊',
    deadline_approaching: '⏰',
    budget_alert: '💰',
    team_mention: '👥',
    document_uploaded: '📄',
    comment_added: '💬',
    appointment_reminder: '📅',
    system: 'ℹ️',
  };

  return icons[type] || 'ℹ️';
}
