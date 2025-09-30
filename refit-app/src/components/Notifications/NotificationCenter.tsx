'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/Button';
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  X,
} from 'lucide-react';
import { NotificationType, NotificationPriority } from '@/types';

interface NotificationCenterProps {
  onClose?: () => void;
}

export function NotificationCenter({ onClose }: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    getNotificationsByType,
    getNotificationsByPriority,
  } = useNotifications();

  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<NotificationPriority | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Apply filters
  const filteredNotifications = notifications.filter(notification => {
    if (filterType !== 'all' && notification.type !== filterType) {
      return false;
    }
    if (filterPriority !== 'all' && notification.priority !== filterPriority) {
      return false;
    }
    return true;
  });

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleClearAll = async () => {
    if (confirm('Sei sicuro di voler eliminare tutte le notifiche?')) {
      await clearAll();
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento notifiche...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col max-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">
            Notifiche
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Actions Bar */}
      <div className="p-3 border-b border-gray-200 flex items-center gap-2 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
          title="Segna tutte come lette"
        >
          <CheckCheck className="h-4 w-4 mr-1" />
          Segna tutto
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          title="Filtri"
        >
          <Filter className="h-4 w-4 mr-1" />
          Filtri
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          disabled={notifications.length === 0}
          title="Elimina tutte"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Elimina
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border-b border-gray-200 space-y-3 flex-shrink-0">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as NotificationType | 'all')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tutti i tipi</option>
              <option value="task_assigned">Task assegnati</option>
              <option value="task_completed">Task completati</option>
              <option value="task_overdue">Task scaduti</option>
              <option value="project_update">Aggiornamenti progetto</option>
              <option value="deadline_approaching">Scadenze in arrivo</option>
              <option value="budget_alert">Alert budget</option>
              <option value="team_mention">Menzioni team</option>
              <option value="document_uploaded">Documenti caricati</option>
              <option value="comment_added">Commenti aggiunti</option>
              <option value="appointment_reminder">Promemoria appuntamenti</option>
              <option value="system">Sistema</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Priorità
            </label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as NotificationPriority | 'all')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tutte le priorità</option>
              <option value="low">Bassa</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {notifications.length === 0 ? 'Nessuna notifica' : 'Nessun risultato'}
            </h3>
            <p className="text-gray-600">
              {notifications.length === 0
                ? 'Quando riceverai notifiche, appariranno qui'
                : 'Prova a modificare i filtri'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredNotifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 text-center text-xs text-gray-500 flex-shrink-0">
          Mostrando {filteredNotifications.length} di {notifications.length} notifiche
        </div>
      )}
    </div>
  );
}
