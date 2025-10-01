'use client';

import { useState, useMemo } from 'react';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { ActivityItem } from './ActivityItem';
import type { ActivityFeedFilters, ActivityType, ActivityTargetType } from '@/types';
import {
  Activity,
  Search,
  Filter,
  Calendar,
  Users,
  X,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export function ActivityFeed() {
  const {
    activities,
    loading,
    getActivities,
    getActivitiesGroupedByDate,
    clearOldActivities,
  } = useActivityFeed();

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ActivityFeedFilters>({});

  // Apply filters
  const filteredActivities = useMemo(() => {
    return getActivities(filters);
  }, [getActivities, filters]);

  // Group by date
  const groupedActivities = useMemo(() => {
    const grouped: Record<string, typeof filteredActivities> = {};

    filteredActivities.forEach((activity) => {
      const date = new Date(activity.timestamp).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(activity);
    });

    return grouped;
  }, [filteredActivities]);

  // Filter handlers
  const handleTypeFilter = (type: ActivityType) => {
    const currentTypes = filters.types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];

    setFilters({
      ...filters,
      types: newTypes.length > 0 ? newTypes : undefined,
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      searchQuery: e.target.value || undefined,
    });
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleClearOld = async () => {
    if (confirm('Eliminare le attività più vecchie di 30 giorni?')) {
      await clearOldActivities(30);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Caricamento attività...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">
            Activity Feed
            {filteredActivities.length !== activities.length && (
              <span className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded-full">
                {filteredActivities.length}
              </span>
            )}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-blue-50 text-blue-600' : ''}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filtri
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearOld}
            title="Elimina attività vecchie"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border-b border-gray-200 space-y-3 flex-shrink-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca attività..."
              value={filters.searchQuery || ''}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type filters */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Tipo Attività
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'task_created', label: 'Task Creati' },
                { value: 'task_completed', label: 'Task Completati' },
                { value: 'project_created', label: 'Progetti Creati' },
                { value: 'comment_added', label: 'Commenti' },
                { value: 'document_uploaded', label: 'Documenti' },
                { value: 'member_joined', label: 'Membri Aggiunti' },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleTypeFilter(type.value as ActivityType)}
                  className={`
                    px-3 py-1 text-xs rounded-full transition-colors
                    ${
                      filters.types?.includes(type.value as ActivityType)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear filters */}
          {(filters.types || filters.searchQuery) && (
            <div className="flex justify-end">
              <button
                onClick={handleClearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Pulisci filtri
              </button>
            </div>
          )}
        </div>
      )}

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto">
        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center">
            <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activities.length === 0
                ? 'Nessuna attività'
                : 'Nessun risultato'}
            </h3>
            <p className="text-gray-600">
              {activities.length === 0
                ? 'Le attività del team appariranno qui'
                : 'Prova a modificare i filtri'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {Object.entries(groupedActivities)
              .sort(([a], [b]) => b.localeCompare(a)) // Sort by date descending
              .map(([date, dateActivities]) => (
                <div key={date} className="bg-white">
                  {/* Date header */}
                  <div className="sticky top-0 bg-gray-100 px-4 py-2 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {format(new Date(date), 'EEEE, d MMMM yyyy', {
                          locale: it,
                        })}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({dateActivities.length}{' '}
                        {dateActivities.length === 1 ? 'attività' : 'attività'})
                      </span>
                    </div>
                  </div>

                  {/* Activities for this date */}
                  <div className="relative">
                    {dateActivities.map((activity, index) => (
                      <div
                        key={activity.id}
                        className={index === dateActivities.length - 1 ? 'last-item' : ''}
                      >
                        <ActivityItem activity={activity} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
