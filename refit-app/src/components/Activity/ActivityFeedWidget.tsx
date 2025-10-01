'use client';

import { useActivityFeed } from '@/hooks/useActivityFeed';
import { Activity, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import type { ActivityType } from '@/types';

interface ActivityFeedWidgetProps {
  onViewAll?: () => void;
  limit?: number;
}

const activityTypeLabels: Record<ActivityType, string> = {
  task_created: 'ha creato il task',
  task_completed: 'ha completato il task',
  task_assigned: 'ha assegnato il task',
  task_updated: 'ha aggiornato il task',
  comment_added: 'ha commentato',
  document_uploaded: 'ha caricato un documento',
  project_created: 'ha creato il progetto',
  project_updated: 'ha aggiornato il progetto',
  member_joined: 'è entrato nel team',
  member_left: 'ha lasciato il team',
  workload_changed: 'ha modificato il carico di lavoro',
  quote_created: 'ha creato un preventivo',
  quote_approved: 'ha approvato un preventivo',
};

const activityTypeEmojis: Record<ActivityType, string> = {
  task_created: '📋',
  task_completed: '✅',
  task_assigned: '👤',
  task_updated: '✏️',
  comment_added: '💬',
  document_uploaded: '📄',
  project_created: '📁',
  project_updated: '🔄',
  member_joined: '👋',
  member_left: '👋',
  workload_changed: '📊',
  quote_created: '📝',
  quote_approved: '✔️',
};

export function ActivityFeedWidget({
  onViewAll,
  limit = 5,
}: ActivityFeedWidgetProps) {
  const { getRecentActivities, loading } = useActivityFeed();

  const recentActivities = getRecentActivities(limit);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <Activity className="h-8 w-8 text-gray-400 animate-pulse mx-auto mb-2" />
            <p className="text-sm text-gray-600">Caricamento...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">
              Attività Recenti
            </h3>
          </div>
          {onViewAll && recentActivities.length > 0 && (
            <button
              onClick={onViewAll}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Vedi tutte
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-gray-100">
        {recentActivities.length === 0 ? (
          <div className="p-8 text-center">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-600">Nessuna attività recente</p>
            <p className="text-xs text-gray-500 mt-1">
              Le attività del team appariranno qui
            </p>
          </div>
        ) : (
          recentActivities.map((activity) => {
            const timeAgo = formatDistanceToNow(new Date(activity.timestamp), {
              addSuffix: true,
              locale: it,
            });

            const initials = activity.userName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={activity.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={onViewAll}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  {activity.userAvatar ? (
                    <img
                      src={activity.userAvatar}
                      alt={activity.userName}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600 flex-shrink-0">
                      {initials}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">
                          {activity.userName}
                        </span>{' '}
                        <span className="text-gray-600">{activity.action}</span>
                        {activity.targetName && (
                          <>
                            {' '}
                            <span className="font-medium">
                              {activity.targetName}
                            </span>
                          </>
                        )}
                      </p>

                      {/* Type emoji */}
                      <span className="text-lg flex-shrink-0">
                        {activityTypeEmojis[activity.type]}
                      </span>
                    </div>

                    {/* Timestamp */}
                    <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>

                    {/* Description (truncated) */}
                    {activity.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                        {activity.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
