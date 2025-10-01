import { useState, useCallback, useEffect } from 'react';
import type {
  TeamActivity,
  ActivityType,
  ActivityTargetType,
  ActivityVisibility,
  ActivityFeedFilters,
} from '@/types';
import { ACTIVITY_STORAGE_KEY } from '@/types';

/**
 * Hook for managing team activity feed
 * Tracks all user actions and provides filtering/search capabilities
 */
export function useActivityFeed() {
  const [activities, setActivities] = useState<TeamActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Load activities from localStorage
  useEffect(() => {
    const loadActivities = () => {
      try {
        const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Sort by timestamp descending (newest first)
          const sorted = parsed.sort(
            (a: TeamActivity, b: TeamActivity) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setActivities(sorted);
        }
      } catch (error) {
        console.error('Error loading activities:', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  // Save activities to localStorage
  const saveActivities = useCallback((updatedActivities: TeamActivity[]) => {
    try {
      localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(updatedActivities));
      setActivities(updatedActivities);
    } catch (error) {
      console.error('Error saving activities:', error);
    }
  }, []);

  /**
   * Add new activity to feed
   */
  const addActivity = useCallback(
    async (
      activityData: Omit<TeamActivity, 'id' | 'timestamp'>
    ): Promise<TeamActivity> => {
      const newActivity: TeamActivity = {
        ...activityData,
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      };

      const updated = [newActivity, ...activities];
      saveActivities(updated);

      return newActivity;
    },
    [activities, saveActivities]
  );

  /**
   * Get activities with optional filters
   */
  const getActivities = useCallback(
    (filters?: ActivityFeedFilters): TeamActivity[] => {
      let filtered = [...activities];

      if (!filters) return filtered;

      // Filter by types
      if (filters.types && filters.types.length > 0) {
        filtered = filtered.filter((a) => filters.types!.includes(a.type));
      }

      // Filter by users
      if (filters.users && filters.users.length > 0) {
        filtered = filtered.filter((a) => filters.users!.includes(a.userId));
      }

      // Filter by target type
      if (filters.targetType) {
        filtered = filtered.filter((a) => a.targetType === filters.targetType);
      }

      // Filter by date range
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        filtered = filtered.filter(
          (a) => new Date(a.timestamp) >= fromDate
        );
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        filtered = filtered.filter((a) => new Date(a.timestamp) <= toDate);
      }

      // Filter by visibility
      if (filters.visibility) {
        filtered = filtered.filter((a) => a.visibility === filters.visibility);
      }

      // Search in action and description
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.action.toLowerCase().includes(query) ||
            a.description?.toLowerCase().includes(query) ||
            a.targetName?.toLowerCase().includes(query) ||
            a.userName.toLowerCase().includes(query)
        );
      }

      return filtered;
    },
    [activities]
  );

  /**
   * Get recent activities (last N)
   */
  const getRecentActivities = useCallback(
    (limit: number = 10): TeamActivity[] => {
      return activities.slice(0, limit);
    },
    [activities]
  );

  /**
   * Get activities by user
   */
  const getActivitiesByUser = useCallback(
    (userId: string): TeamActivity[] => {
      return activities.filter((a) => a.userId === userId);
    },
    [activities]
  );

  /**
   * Get activities by target (task, project, etc.)
   */
  const getActivitiesByTarget = useCallback(
    (targetId: string): TeamActivity[] => {
      return activities.filter((a) => a.targetId === targetId);
    },
    [activities]
  );

  /**
   * Delete activity by ID
   */
  const deleteActivity = useCallback(
    async (id: string): Promise<void> => {
      const updated = activities.filter((a) => a.id !== id);
      saveActivities(updated);
    },
    [activities, saveActivities]
  );

  /**
   * Clear old activities (keep only last N days)
   */
  const clearOldActivities = useCallback(
    async (daysToKeep: number = 30): Promise<void> => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const updated = activities.filter(
        (a) => new Date(a.timestamp) >= cutoffDate
      );

      saveActivities(updated);
    },
    [activities, saveActivities]
  );

  /**
   * Clear all activities
   */
  const clearAllActivities = useCallback(async (): Promise<void> => {
    saveActivities([]);
  }, [saveActivities]);

  /**
   * Get activity count by type
   */
  const getActivityCountByType = useCallback(
    (type: ActivityType): number => {
      return activities.filter((a) => a.type === type).length;
    },
    [activities]
  );

  /**
   * Get activity count by user
   */
  const getActivityCountByUser = useCallback(
    (userId: string): number => {
      return activities.filter((a) => a.userId === userId).length;
    },
    [activities]
  );

  /**
   * Get grouped activities by date (for timeline view)
   */
  const getActivitiesGroupedByDate = useCallback((): Record<
    string,
    TeamActivity[]
  > => {
    const grouped: Record<string, TeamActivity[]> = {};

    activities.forEach((activity) => {
      const date = new Date(activity.timestamp).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(activity);
    });

    return grouped;
  }, [activities]);

  return {
    // State
    activities,
    loading,

    // CRUD operations
    addActivity,
    deleteActivity,
    clearOldActivities,
    clearAllActivities,

    // Queries
    getActivities,
    getRecentActivities,
    getActivitiesByUser,
    getActivitiesByTarget,
    getActivityCountByType,
    getActivityCountByUser,
    getActivitiesGroupedByDate,
  };
}
