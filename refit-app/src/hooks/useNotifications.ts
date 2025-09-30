import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationPreferences,
  NOTIFICATION_STORAGE_KEYS,
} from '@/types';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;

  // CRUD Operations
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => Promise<Notification>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;

  // Filter Operations
  getUnreadNotifications: () => Notification[];
  getNotificationsByType: (type: NotificationType) => Notification[];
  getNotificationsByPriority: (priority: NotificationPriority) => Notification[];
  getRecentNotifications: (limit?: number) => Notification[];

  // Preferences
  preferences: NotificationPreferences;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  isNotificationAllowed: (type: NotificationType) => boolean;

  // Utility
  refreshNotifications: () => void;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  email: false,
  push: true,
  inApp: true,
  types: {
    task_assigned: true,
    task_completed: true,
    task_overdue: true,
    project_update: true,
    deadline_approaching: true,
    budget_alert: true,
    team_mention: true,
    document_uploaded: true,
    comment_added: true,
    appointment_reminder: true,
    system: true,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
};

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load notifications from localStorage
  const loadNotifications = useCallback(() => {
    try {
      setLoading(true);
      const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEYS.NOTIFICATIONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Sort by createdAt descending (newest first)
        const sorted = parsed.sort((a: Notification, b: Notification) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNotifications(sorted);
      } else {
        setNotifications([]);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load preferences from localStorage
  const loadPreferences = useCallback(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEYS.PREFERENCES);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      } else {
        setPreferences(DEFAULT_PREFERENCES);
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
      setPreferences(DEFAULT_PREFERENCES);
    }
  }, []);

  // Save notifications to localStorage
  const saveNotifications = useCallback((notificationsToSave: Notification[]) => {
    try {
      localStorage.setItem(NOTIFICATION_STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notificationsToSave));
      setNotifications(notificationsToSave);
    } catch (err) {
      setError('Failed to save notifications');
      console.error('Error saving notifications:', err);
      throw err;
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = useCallback((preferencesToSave: NotificationPreferences) => {
    try {
      localStorage.setItem(NOTIFICATION_STORAGE_KEYS.PREFERENCES, JSON.stringify(preferencesToSave));
      setPreferences(preferencesToSave);
    } catch (err) {
      setError('Failed to save preferences');
      console.error('Error saving preferences:', err);
      throw err;
    }
  }, []);

  // Initialize
  useEffect(() => {
    loadNotifications();
    loadPreferences();
  }, [loadNotifications, loadPreferences]);

  // Generate unique ID
  const generateId = () => `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Check if notification is allowed based on preferences
  const isNotificationAllowed = useCallback((type: NotificationType): boolean => {
    if (!preferences.inApp) return false;
    if (!preferences.types[type]) return false;

    // Check quiet hours
    if (preferences.quietHours?.enabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const { start, end } = preferences.quietHours;

      if (start && end) {
        if (start < end) {
          // Normal case: start=22:00, end=08:00 means 22:00-23:59 and 00:00-08:00
          if (currentTime >= start || currentTime < end) {
            return false;
          }
        } else {
          // Wrapped case: start=08:00, end=22:00 means 08:00-22:00
          if (currentTime >= start && currentTime < end) {
            return false;
          }
        }
      }
    }

    return true;
  }, [preferences]);

  // Add notification
  const addNotification = useCallback(async (
    notificationData: Omit<Notification, 'id' | 'createdAt' | 'read'>
  ): Promise<Notification> => {
    // Check if notification is allowed
    if (!isNotificationAllowed(notificationData.type)) {
      throw new Error('Notification type is disabled in preferences');
    }

    const newNotification: Notification = {
      ...notificationData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      read: false,
    };

    const updated = [newNotification, ...notifications];
    saveNotifications(updated);
    return newNotification;
  }, [notifications, saveNotifications, isNotificationAllowed]);

  // Mark as read
  const markAsRead = useCallback(async (id: string) => {
    const updated = notifications.map(notification =>
      notification.id === id
        ? { ...notification, read: true, readAt: new Date().toISOString() }
        : notification
    );
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    const now = new Date().toISOString();
    const updated = notifications.map(notification =>
      notification.read ? notification : { ...notification, read: true, readAt: now }
    );
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    const updated = notifications.filter(notification => notification.id !== id);
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    saveNotifications([]);
  }, [saveNotifications]);

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.read);
  }, [notifications]);

  // Get notifications by type
  const getNotificationsByType = useCallback((type: NotificationType) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  // Get notifications by priority
  const getNotificationsByPriority = useCallback((priority: NotificationPriority) => {
    return notifications.filter(n => n.priority === priority);
  }, [notifications]);

  // Get recent notifications
  const getRecentNotifications = useCallback((limit: number = 10) => {
    return notifications.slice(0, limit);
  }, [notifications]);

  // Update preferences
  const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
    const updated = { ...preferences, ...updates };
    savePreferences(updated);
  }, [preferences, savePreferences]);

  // Refresh notifications
  const refreshNotifications = useCallback(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    getUnreadNotifications,
    getNotificationsByType,
    getNotificationsByPriority,
    getRecentNotifications,
    preferences,
    updatePreferences,
    isNotificationAllowed,
    refreshNotifications,
  };
}
