'use client';

import type { TeamActivity, ActivityType } from '@/types';
import {
  CheckCircle,
  FileText,
  FolderPlus,
  UserPlus,
  UserMinus,
  Edit,
  Upload,
  FileCheck,
  TrendingUp,
  Circle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface ActivityItemProps {
  activity: TeamActivity;
  onClick?: () => void;
}

// Icon mapping for activity types
const activityIcons: Record<ActivityType, React.ReactNode> = {
  task_created: <Circle className="h-5 w-5" />,
  task_completed: <CheckCircle className="h-5 w-5" />,
  task_assigned: <UserPlus className="h-5 w-5" />,
  task_updated: <Edit className="h-5 w-5" />,
  comment_added: <FileText className="h-5 w-5" />,
  document_uploaded: <Upload className="h-5 w-5" />,
  project_created: <FolderPlus className="h-5 w-5" />,
  project_updated: <Edit className="h-5 w-5" />,
  member_joined: <UserPlus className="h-5 w-5" />,
  member_left: <UserMinus className="h-5 w-5" />,
  workload_changed: <TrendingUp className="h-5 w-5" />,
  quote_created: <FileText className="h-5 w-5" />,
  quote_approved: <FileCheck className="h-5 w-5" />,
};

// Color mapping for activity types
const activityColors: Record<ActivityType, string> = {
  task_created: 'bg-blue-100 text-blue-600',
  task_completed: 'bg-green-100 text-green-600',
  task_assigned: 'bg-purple-100 text-purple-600',
  task_updated: 'bg-yellow-100 text-yellow-600',
  comment_added: 'bg-pink-100 text-pink-600',
  document_uploaded: 'bg-indigo-100 text-indigo-600',
  project_created: 'bg-blue-100 text-blue-600',
  project_updated: 'bg-yellow-100 text-yellow-600',
  member_joined: 'bg-green-100 text-green-600',
  member_left: 'bg-red-100 text-red-600',
  workload_changed: 'bg-orange-100 text-orange-600',
  quote_created: 'bg-teal-100 text-teal-600',
  quote_approved: 'bg-green-100 text-green-600',
};

export function ActivityItem({ activity, onClick }: ActivityItemProps) {
  const timeAgo = formatDistanceToNow(new Date(activity.timestamp), {
    addSuffix: true,
    locale: it,
  });

  // Get initials for avatar
  const initials = activity.userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      onClick={onClick}
      className={`
        flex items-start gap-3 p-4
        ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}
        transition-colors
      `}
    >
      {/* Timeline dot/line */}
      <div className="relative flex flex-col items-center">
        {/* Icon */}
        <div
          className={`
            flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
            ${activityColors[activity.type]}
          `}
        >
          {activityIcons[activity.type]}
        </div>

        {/* Vertical line (except for last item - handled in parent) */}
        <div className="absolute top-10 w-0.5 h-full bg-gray-200" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            {/* User avatar */}
            {activity.userAvatar ? (
              <img
                src={activity.userAvatar}
                alt={activity.userName}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                {initials}
              </div>
            )}

            {/* Action text */}
            <div className="text-sm">
              <span className="font-semibold text-gray-900">
                {activity.userName}
              </span>{' '}
              <span className="text-gray-600">{activity.action}</span>
              {activity.targetName && (
                <>
                  {' '}
                  <span className="font-medium text-gray-900">
                    {activity.targetName}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Timestamp */}
          <span className="text-xs text-gray-500 flex-shrink-0">
            {timeAgo}
          </span>
        </div>

        {/* Description */}
        {activity.description && (
          <p className="text-sm text-gray-600 mt-1 ml-8">
            {activity.description}
          </p>
        )}

        {/* Metadata (optional) */}
        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
          <div className="mt-2 ml-8 flex flex-wrap gap-2">
            {Object.entries(activity.metadata).map(([key, value]) => (
              <span
                key={key}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
              >
                {key}: {String(value)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
