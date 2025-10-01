import type { Notification } from '@/types';

/**
 * Group notifications by type and related entity
 */
export interface NotificationGroup {
  id: string;
  type: Notification['type'];
  count: number;
  latestNotification: Notification;
  notifications: Notification[];
  relatedEntityId?: string;
  relatedEntityType?: 'project' | 'task' | 'user' | 'document';
}

/**
 * Group notifications intelligently
 * Groups by type and related entity (project, task, etc.)
 */
export function groupNotifications(notifications: Notification[]): NotificationGroup[] {
  const groups = new Map<string, NotificationGroup>();

  notifications.forEach((notification) => {
    // Generate group key based on type and related entity
    const groupKey = getGroupKey(notification);

    if (groups.has(groupKey)) {
      const group = groups.get(groupKey)!;
      group.count++;
      group.notifications.push(notification);

      // Update latest notification if this one is newer
      if (
        new Date(notification.createdAt) > new Date(group.latestNotification.createdAt)
      ) {
        group.latestNotification = notification;
      }
    } else {
      // Create new group
      const relatedEntity = getRelatedEntity(notification);

      groups.set(groupKey, {
        id: groupKey,
        type: notification.type,
        count: 1,
        latestNotification: notification,
        notifications: [notification],
        relatedEntityId: relatedEntity?.id,
        relatedEntityType: relatedEntity?.type,
      });
    }
  });

  // Convert to array and sort by latest notification date
  return Array.from(groups.values()).sort(
    (a, b) =>
      new Date(b.latestNotification.createdAt).getTime() -
      new Date(a.latestNotification.createdAt).getTime()
  );
}

/**
 * Generate a unique group key for a notification
 */
function getGroupKey(notification: Notification): string {
  const { type, metadata } = notification;

  // Group by type and related entity
  if (metadata?.projectId) {
    return `${type}_project_${metadata.projectId}`;
  }

  if (metadata?.taskId) {
    return `${type}_task_${metadata.taskId}`;
  }

  if (metadata?.userId) {
    return `${type}_user_${metadata.userId}`;
  }

  if (metadata?.documentId) {
    return `${type}_document_${metadata.documentId}`;
  }

  // Default: group by type only
  return `${type}_general`;
}

/**
 * Extract related entity information from notification metadata
 */
function getRelatedEntity(
  notification: Notification
): { id: string; type: 'project' | 'task' | 'user' | 'document' } | undefined {
  const { metadata } = notification;

  if (metadata?.projectId) {
    return { id: metadata.projectId, type: 'project' };
  }

  if (metadata?.taskId) {
    return { id: metadata.taskId, type: 'task' };
  }

  if (metadata?.userId) {
    return { id: metadata.userId, type: 'user' };
  }

  if (metadata?.documentId) {
    return { id: metadata.documentId, type: 'document' };
  }

  return undefined;
}

/**
 * Get grouped notification title
 */
export function getGroupedTitle(group: NotificationGroup): string {
  if (group.count === 1) {
    return group.latestNotification.title;
  }

  const typeLabels: Record<Notification['type'], string> = {
    task_assigned: 'task assegnati',
    task_completed: 'task completati',
    task_overdue: 'task scaduti',
    project_update: 'aggiornamenti progetto',
    deadline_approaching: 'scadenze in arrivo',
    budget_alert: 'alert budget',
    team_mention: 'menzioni',
    document_uploaded: 'documenti caricati',
    comment_added: 'nuovi commenti',
    appointment_reminder: 'promemoria appuntamenti',
    system: 'notifiche di sistema',
  };

  const label = typeLabels[group.type] || 'notifiche';
  return `${group.count} ${label}`;
}

/**
 * Get grouped notification message
 */
export function getGroupedMessage(group: NotificationGroup): string {
  if (group.count === 1) {
    return group.latestNotification.message;
  }

  // Show latest message with indicator of more
  return `${group.latestNotification.message} (+${group.count - 1} altre)`;
}

/**
 * Check if notifications should be grouped
 * Only group if there are multiple notifications of the same type within a time window
 */
export function shouldGroupNotifications(
  notifications: Notification[],
  timeWindowMinutes: number = 60
): boolean {
  if (notifications.length <= 1) {
    return false;
  }

  const typeGroups = new Map<string, number>();

  notifications.forEach((notification) => {
    const count = typeGroups.get(notification.type) || 0;
    typeGroups.set(notification.type, count + 1);
  });

  // Check if any type has more than 2 notifications
  return Array.from(typeGroups.values()).some((count) => count >= 2);
}
