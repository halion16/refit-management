'use client';

import { Notification, NotificationType } from '@/types';
import {
  CheckCircle,
  AlertCircle,
  Clock,
  FolderOpen,
  Calendar,
  Euro,
  Users,
  FileText,
  MessageSquare,
  Bell,
  X,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: () => void;
}

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  task_assigned: <CheckCircle className="h-5 w-5" />,
  task_completed: <CheckCircle className="h-5 w-5" />,
  task_overdue: <AlertCircle className="h-5 w-5" />,
  project_update: <FolderOpen className="h-5 w-5" />,
  deadline_approaching: <Clock className="h-5 w-5" />,
  budget_alert: <Euro className="h-5 w-5" />,
  team_mention: <Users className="h-5 w-5" />,
  document_uploaded: <FileText className="h-5 w-5" />,
  comment_added: <MessageSquare className="h-5 w-5" />,
  appointment_reminder: <Calendar className="h-5 w-5" />,
  system: <Bell className="h-5 w-5" />,
};

const notificationColors: Record<NotificationType, string> = {
  task_assigned: 'bg-blue-100 text-blue-600',
  task_completed: 'bg-green-100 text-green-600',
  task_overdue: 'bg-red-100 text-red-600',
  project_update: 'bg-purple-100 text-purple-600',
  deadline_approaching: 'bg-orange-100 text-orange-600',
  budget_alert: 'bg-yellow-100 text-yellow-600',
  team_mention: 'bg-indigo-100 text-indigo-600',
  document_uploaded: 'bg-teal-100 text-teal-600',
  comment_added: 'bg-pink-100 text-pink-600',
  appointment_reminder: 'bg-cyan-100 text-cyan-600',
  system: 'bg-gray-100 text-gray-600',
};

const priorityColors = {
  low: 'border-gray-200',
  medium: 'border-blue-300',
  high: 'border-orange-300',
  urgent: 'border-red-400',
};

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (onClick) {
      onClick();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notification.id);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: it,
  });

  return (
    <div
      onClick={handleClick}
      className={`
        group relative p-4 border-l-4 ${priorityColors[notification.priority]}
        ${notification.read ? 'bg-white' : 'bg-blue-50'}
        hover:bg-gray-50 transition-colors cursor-pointer
      `}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute top-4 right-4">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
        </div>
      )}

      <div className="flex items-start gap-3 pr-8">
        {/* Icon */}
        <div className={`flex-shrink-0 p-2 rounded-lg ${notificationColors[notification.type]}`}>
          {notificationIcons[notification.type]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={`text-sm font-semibold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
              {notification.title}
            </h4>
          </div>

          <p className={`text-sm mb-2 ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
            {notification.message}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{timeAgo}</span>

            {notification.actionLabel && notification.actionUrl && (
              <button
                onClick={handleClick}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                {notification.actionLabel}
              </button>
            )}
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
          title="Elimina notifica"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
}
