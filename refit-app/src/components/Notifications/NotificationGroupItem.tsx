'use client';

import { useState } from 'react';
import { NotificationGroup, getGroupedTitle, getGroupedMessage } from '@/lib/notificationGrouping';
import { NotificationItem } from './NotificationItem';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface NotificationGroupItemProps {
  group: NotificationGroup;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function NotificationGroupItem({
  group,
  onMarkAsRead,
  onDelete,
}: NotificationGroupItemProps) {
  const [expanded, setExpanded] = useState(false);

  // If only one notification, render it directly
  if (group.count === 1) {
    return (
      <NotificationItem
        notification={group.latestNotification}
        onMarkAsRead={onMarkAsRead}
        onDelete={onDelete}
      />
    );
  }

  const timeAgo = formatDistanceToNow(new Date(group.latestNotification.createdAt), {
    addSuffix: true,
    locale: it,
  });

  const hasUnread = group.notifications.some((n) => !n.read);

  return (
    <div className="border-b border-gray-200">
      {/* Group Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className={`
          p-4 cursor-pointer transition-colors
          ${hasUnread ? 'bg-blue-50 hover:bg-blue-100' : 'bg-white hover:bg-gray-50'}
        `}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`text-sm font-semibold ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                {getGroupedTitle(group)}
              </h4>
              {hasUnread && (
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </div>

            <p className={`text-sm mb-2 ${hasUnread ? 'text-gray-700' : 'text-gray-500'}`}>
              {getGroupedMessage(group)}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{timeAgo}</span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                {expanded ? (
                  <>
                    Nascondi <ChevronUp className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    Mostra tutte ({group.count}) <ChevronDown className="h-3 w-3" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Notifications */}
      {expanded && (
        <div className="bg-gray-50 border-t border-gray-200">
          {group.notifications.map((notification) => (
            <div key={notification.id} className="border-b border-gray-200 last:border-b-0">
              <NotificationItem
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
